import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiKeysGuard } from 'src/api-keys/api-keys.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Public()
  @UseGuards(ApiKeysGuard)
  @Permissions(['user-read', 'user-create'])
  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return {
      message: 'Retrieved all users',
      data,
    };
  }

  @Get(':username')
  async findByUsername(@Param('username') username: string) {
    const data = await this.usersService.findByUsername(username);

    return {
      message: 'Retrieved user',
      data,
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
