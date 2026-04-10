import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class RecordPlayDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7200)
  durationListened?: number;

  @IsOptional()
  @IsString()
  source?: string;
}
