import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class AddFeatureDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsBoolean()
  highlight?: boolean;
}
