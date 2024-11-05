import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private db: PrismaService) {}

  async findAll() {
    return this.db.permission.findMany();
  }

  async create(createPermissionDto: CreatePermissionDto) {
    return this.db.permission.create({
      data: createPermissionDto,
    });
  }
}
