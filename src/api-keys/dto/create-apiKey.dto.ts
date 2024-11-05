import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissions: string[];
}
