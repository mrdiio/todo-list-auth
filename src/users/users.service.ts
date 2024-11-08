import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private db: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return {
      message: 'User created',
      data: createUserDto,
    };
  }

  async findAll() {
    return this.db.user.findMany();
  }

  async findByUsername(username: string): Promise<User> {
    return this.db.user.findUnique({
      where: {
        username,
      },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.db.user.findUnique({
      where: {
        email,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);

    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
