import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwtPayload.type';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    config: ConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshStrategy.cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: true,
      secretOrKey: config.get('JWT_REFRESH_KEY'),
    });
  }

  private static cookieExtractor(req: Request) {
    return req.cookies['refresh_token'];
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.userService.findByUsername(payload.username);

    if (!user) {
      return null;
    }

    payload = {
      sub: user.id,
      username: user.username,
      name: user.name,
    };

    return payload;
  }
}
