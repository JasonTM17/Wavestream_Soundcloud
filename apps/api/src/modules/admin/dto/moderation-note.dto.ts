import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ModerationNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
