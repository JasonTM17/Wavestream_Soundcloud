import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from 'src/database/entities/base.entity';
import { TrackEntity } from 'src/database/entities/track.entity';

@Entity('genres')
export class GenreEntity extends AppBaseEntity {
  @Index({ unique: true })
  @Column()
  name!: string;

  @Index({ unique: true })
  @Column()
  slug!: string;

  @OneToMany(() => TrackEntity, (track) => track.genre)
  tracks!: TrackEntity[];
}
