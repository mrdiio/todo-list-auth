import { PrismaService } from 'nestjs-prisma';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';

const mockUsers: User[] = [
  {
    id: 'ca8e6915-e17e-4b01-b958-a7e8a1c9e8e2',
    username: 'stein',
    name: 'Stein',
    email: null,
    role: 'USER',
    password: '$2b$10$hF5DRtr6buNArhXl8WxlneX.Y.39ycAFKYGlEJr2F7NwxCtBZJKXG',
    createdAt: '2024-07-18T01:30:30.844Z' as unknown as Date,
    updatedAt: '2024-07-18T01:30:30.844Z' as unknown as Date,
  },
];

const mockPrismaService = {
  user: {
    findMany: jest.fn().mockResolvedValue(mockUsers),
    findUnique: jest.fn().mockResolvedValue(mockUsers[0]),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toEqual(mockUsers); // Verify returned users match the mock data
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1); // Check if `findMany` is called once
    });

    it('should return an empty array when no users are found', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]); // Scenario: No users in the database
      const users = await service.findAll();

      expect(users).toEqual([]); // Expect an empty array
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1); // Ensure `findMany` is called
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database is down');
      mockPrismaService.user.findMany.mockRejectedValue(error); // Simulate DB failure

      await expect(service.findAll()).rejects.toThrow('Database is down'); // Check for the thrown error
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1); // Ensure `findMany` was called once
    });
  });

  describe('findByUsername', () => {
    it('should return a user when a valid username is provided', async () => {
      const username = 'userone';
      const user = await service.findByUsername(username);

      expect(user).toEqual(mockUsers[0]); // Should match the first mock user
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when no user is found for the given username', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null); // Simulate no user found
      const username = 'nonexistentuser';

      const user = await service.findByUsername(username);

      expect(user).toBeNull(); // Expect the result to be null
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully when searching by username', async () => {
      const error = new Error('Database is down');
      mockPrismaService.user.findUnique.mockRejectedValue(error); // Simulate DB failure

      await expect(service.findByUsername('userone')).rejects.toThrow(
        'Database is down',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'userone' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
