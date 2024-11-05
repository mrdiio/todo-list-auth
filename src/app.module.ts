import { HttpStatus, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import {
  PrismaModule,
  providePrismaClientExceptionFilter,
} from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ApiKeysService } from './api-keys/api-keys.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    ApiKeysModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiKeysService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    providePrismaClientExceptionFilter({
      P2000: HttpStatus.BAD_REQUEST,
      P2002: HttpStatus.CONFLICT,
      P2025: HttpStatus.NOT_FOUND,
    }),
  ],
})
export class AppModule {}
