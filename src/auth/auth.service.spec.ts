import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
};

const mockUsersService = {
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mocked_token'),
};

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'JWT_SECRET_KEY') return 'mock_jwt_secret';
    if (key === 'JWT_REFRESH_KEY') return 'mock_refresh_secret';
    if (key === 'GOOGLE_CLIENT_ID') return 'mock_google_client_id';
  }),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return the user if username and password are valid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await service.validateUser('testuser', 'password');

      expect(result).toEqual(mockUser);
      expect(userService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password',
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(
        service.validateUser('invaliduser', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      await expect(
        service.validateUser('testuser', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should set cookies and log in a user', async () => {
      const res = { cookie: jest.fn() } as unknown as Response;
      const payload = { username: 'testuser', id: 1 };

      const result = await service.login(payload, res);

      expect(result.username).toBe('testuser');
      expect(res.cookie).toHaveBeenCalledTimes(2); // Check if cookies were set
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set new cookies', async () => {
      const res = { cookie: jest.fn() } as unknown as Response;
      const payload = { username: 'testuser', id: 1 };

      const result = await service.refresh(payload, res);

      expect(result.username).toBe('testuser');
      expect(res.cookie).toHaveBeenCalledTimes(2); // Check if cookies were set
    });
  });
});
