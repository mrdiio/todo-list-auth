import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LocalGuard } from './guards/local.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshGuard } from './guards/refresh.guard';

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
}
