import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { Request } from 'express';
import { CreateApiKeyDto } from './dto/create-apiKey.dto';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeyService: ApiKeysService) {}

  @Get()
  async findAll() {
    const data = await this.apiKeyService.findAll();
    return {
      message: 'Retrieved all api keys',
      data,
    };
  }

  @Post()
  async create(@Req() req: Request, @Body() createApiKeyDto: CreateApiKeyDto) {
    const data = await this.apiKeyService.create(createApiKeyDto, req.user);
    return {
      message: 'Api key created',
      data,
    };
  }
}
