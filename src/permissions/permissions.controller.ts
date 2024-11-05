import { Body, Controller, Get, Post } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll() {
    const data = await this.permissionsService.findAll();
    return {
      message: 'Retrieved all permissions',
      data,
    };
  }

  @Post()
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }
}
