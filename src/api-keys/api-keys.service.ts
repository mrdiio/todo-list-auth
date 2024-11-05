import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateApiKeyDto } from './dto/create-apiKey.dto';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private readonly db: PrismaService) {}

  async findAll() {
    const apiKeys = await this.db.apiKey.findMany({
      select: {
        id: true,
        name: true,
        key: true,
        secret: true,
        expiresAt: true,
        permissions: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return apiKeys.map((apiKey) => ({
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      secret: apiKey.secret,
      expiresAt: apiKey.expiresAt,
      permissions: apiKey.permissions.map((permission) => permission.name),
      user: apiKey.user.name,
    }));
  }

  async create(createApiKeyDto: CreateApiKeyDto, user: any) {
    const { app_key, secret_key } = await this.generateApiKey();

    return await this.db.apiKey.create({
      data: {
        name: createApiKeyDto.name,
        key: app_key,
        secret: secret_key,
        userId: user.sub,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        permissions: {
          connect: createApiKeyDto.permissions.map((permission) => ({
            name: permission,
          })),
        },
      },
    });
  }

  private async generateApiKey() {
    // Generate a long random string
    const app_key = crypto.randomBytes(16).toString('hex').toUpperCase();
    const secret_key = crypto.randomBytes(32).toString('hex').toUpperCase();

    return {
      app_key,
      secret_key,
    };
  }

  async validateApiKey(
    appKey: string,
    secretKey: string,
    requiredPermissions: string[],
  ): Promise<boolean> {
    const apiKeyRecord = await this.db.apiKey.findUnique({
      where: { key: appKey },
      include: { permissions: true },
    });

    if (!apiKeyRecord) {
      throw new ForbiddenException('API Key tidak ditemukan');
    }

    if (apiKeyRecord.secret !== secretKey) {
      throw new ForbiddenException('Secret Key tidak valid');
    }

    const currentDate = new Date();
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < currentDate) {
      throw new ForbiddenException('API Key telah kedaluwarsa');
    }

    console.log('apiKeyRecord', apiKeyRecord.permissions);

    const hasRequiredPermissions = requiredPermissions.some((permission) =>
      apiKeyRecord.permissions.some((p) => p.name === permission),
    );

    console.log(requiredPermissions);

    if (!hasRequiredPermissions) {
      throw new ForbiddenException('Izin tidak mencukupi untuk akses ini');
    }

    return true;
  }
}
