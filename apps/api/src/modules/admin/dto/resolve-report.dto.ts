import { ReportStatus } from '@wavestream/shared';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveReportDto {
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
