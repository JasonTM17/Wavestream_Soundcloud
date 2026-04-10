import { PartialType } from '@nestjs/swagger';
import { CreatePlaylistDto } from 'src/modules/playlists/dto/create-playlist.dto';

export class UpdatePlaylistDto extends PartialType(CreatePlaylistDto) {}
