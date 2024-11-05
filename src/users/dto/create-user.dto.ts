import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsEnum(Role)
  @Transform(({ value }) => value.toUpperCase())
  role: string;

  @IsString()
  @MinLength(6)
  password: string;
}
