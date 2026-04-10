import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { AppBaseEntity } from 'src/database/entities/base.entity';
import { TrackEntity } from 'src/database/entities/track.entity';

@Entity('tags')
export class TagEntity extends AppBaseEntity {
  @Index({ unique: true })
  @Column()
  name!: string;

  @Index({ unique: true })
  @Column()
  slug!: string;

  @ManyToMany(() => TrackEntity, (track) => track.tags)
  tracks!: TrackEntity[];
}
