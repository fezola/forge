import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class InstallConnectorDto {
  @IsString()
  @IsNotEmpty()
  manifestId!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}
