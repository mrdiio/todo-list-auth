import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LocalGuard } from './guards/local.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshGuard } from './guards/refresh.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  @Post('local/login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.login(req.user, res);

    return {
      message: 'Login successful',
      data,
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

  @Public()
  @UseGuards(RefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.refresh(req.user, res);

    return {
      message: 'Token refreshed',
      data,
    };
  }

  @Public()
  @Get('google/login')
  @UseGuards(GoogleOAuthGuard)
  async googleLogin() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleLoginCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('jalan dari frontend');

    const data = await this.authService.googleLogin(req.user);

    // return {
    //   message: 'Login successful',
    //   data,
    // };

    res.redirect(
      'http://localhost:3001/auth/callback/google?token=' + data.access_token,
    );
  }

  @Public()
  @Post('validate-token')
  async validateToken(@Req() req: Request) {
    console.log('halooooo validate token');

    console.log('validate token', req.user);

    return req.user;
  }

  @Public()
  @Get('google/verify')
  async googleVerify(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authService.verifyGoogleToken(token, res);

    return {
      message: 'Google token verified',
      data,
    };
  }
}
