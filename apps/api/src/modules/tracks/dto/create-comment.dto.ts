import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(1000)
  body!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  timestampSeconds?: number;

  @IsOptional()
  @IsString()
  parentId?: string;
}
