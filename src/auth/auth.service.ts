import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

const EXPIRE_TIME = 1000 * 60 * 60 * 1; // 1 jam

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

  // async googleLogin(email: string, res: Response) {
  //   const user = await this.userService.findByEmail(email);

  //   if (!user) throw new UnauthorizedException('Email not registered');

  //   const jwtPayload = {
  //     sub: user.id,
  //     username: user.username,
  //     email: user.email,
  //     name: user.name,
  //   };

  //   await this.setCookiesAndTokens(jwtPayload, res);

  //   this.logger.log(`User ${jwtPayload.username} logged in`);

  //   const expiresIn = new Date().setTime(new Date().getTime() + EXPIRE_TIME);

  //   return { ...jwtPayload, expiresIn };
  // }

  async validateUserByGoogleEmail(email: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    return user ? user : null;
  }

  async googleLogin(user: any) {
    const payload = {
      sub: user.id,
      username: user.email,
      email: user.email,
      name: user.name,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET_KEY'),
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '2d',
      secret: this.config.get('JWT_REFRESH_KEY'),
    });

    return { ...payload, access_token, refresh_token };
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
      expiresIn: '1h',
      secret: this.config.get('JWT_SECRET_KEY'),
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '2d',
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

  async verifyGoogleToken(token: string, res: Response): Promise<any> {
    const client = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: this.config.get('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Email not registered');

    const jwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };

    await this.setCookiesAndTokens(jwtPayload, res);

    this.logger.log(`User ${jwtPayload.username} logged in`);

    const expiresIn = new Date().setTime(new Date().getTime() + EXPIRE_TIME);

    return { ...jwtPayload, expiresIn };
  }
}
