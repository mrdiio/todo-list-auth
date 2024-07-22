import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';
import { Response } from 'express';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await this.comparePassword({
      password,
      hash: user.password,
    });

    if (!isPasswordValid) throw new UnauthorizedException('Invalid password');

    return user;
  }

  async login(payload: any, res: Response) {
    await this.setCookiesAndTokens(payload, res);

    this.logger.log(`User ${payload.username} logged in`);

    const expiresIn = new Date().setTime(new Date().getTime() + EXPIRE_TIME);

    return { ...payload, expiresIn };
  }

  async refresh(payload: any, res: Response) {
    await this.setCookiesAndTokens(payload, res);

    this.logger.log(`User ${payload.username} token refreshed`);

    const expiresIn = new Date().setTime(new Date().getTime() + EXPIRE_TIME);

    return { ...payload, expiresIn };
  }

  private async comparePassword(args: {
    password: string;
    hash: string;
  }): Promise<boolean> {
    return bcrypt.compare(args.password, args.hash);
  }

  private async getTokens(payload: JwtPayload): Promise<Tokens> {
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '20s',
      secret: this.config.get('JWT_SECRET_KEY'),
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '3d',
      secret: this.config.get('JWT_REFRESH_KEY'),
    });

    return { access_token, refresh_token };
  }

  private async setCookiesAndTokens(
    payload: JwtPayload,
    res: Response,
  ): Promise<Tokens> {
    const tokens = await this.getTokens(payload);

    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return tokens;
  }
}
