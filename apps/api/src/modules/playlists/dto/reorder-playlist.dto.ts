import { IsArray, IsString } from 'class-validator';

export class ReorderPlaylistDto {
  @IsArray()
  @IsString({ each: true })
  trackIds!: string[];
}
