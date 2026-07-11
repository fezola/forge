import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  interval?: string;

  @IsOptional()
  @IsNumber()
  trialDays?: number;

  @IsOptional()
  @IsNumber()
  maxProjects?: number;

  @IsOptional()
  @IsNumber()
  maxStorageGb?: number;

  @IsOptional()
  @IsNumber()
  maxIdentities?: number;

  @IsOptional()
  @IsNumber()
  maxBandwidthGb?: number;

  @IsOptional()
  @IsNumber()
  maxApiRequests?: number;
}
