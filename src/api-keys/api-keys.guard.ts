import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class ApiKeysGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const appKey = req.header('x-app-key');
    const secretKey = req.header('x-secret-key');

    if (!appKey || !secretKey) {
      throw new UnauthorizedException(
        'API Key atau Secret Key tidak ditemukan',
      );
    }

    // Mengambil izin dari metadata route
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!permissions) {
      return true;
    }

    // Validasi API Key dengan izin yang diperlukan
    const isValid = await this.apiKeysService.validateApiKey(
      appKey,
      secretKey,
      permissions,
    );
    if (!isValid) {
      throw new UnauthorizedException(
        'API Key tidak valid atau izin tidak cukup',
      );
    }

    return true;
  }
}
