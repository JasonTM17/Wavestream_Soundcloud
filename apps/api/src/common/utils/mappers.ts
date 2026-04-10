import { UserDto } from '@wavestream/shared';
import { ProfileEntity } from 'src/database/entities/profile.entity';
import { UserEntity } from 'src/database/entities/user.entity';

export const mapProfile = (profile?: ProfileEntity | null) =>
  profile
    ? {
        id: profile.id,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        bannerUrl: profile.bannerUrl,
        websiteUrl: profile.websiteUrl,
        location: profile.location,
      }
    : null;

export const mapUser = (user: UserEntity, includeEmail = false): UserDto => ({
  id: user.id,
  email: includeEmail ? user.email : undefined,
  username: user.username,
  displayName: user.displayName,
  bio: user.profile?.bio ?? null,
  avatarUrl: user.profile?.avatarUrl ?? null,
  role: user.role,
  isVerified: user.isVerified,
  followerCount: user.followerCount,
  followingCount: user.followingCount,
  trackCount: user.trackCount,
  playlistCount: user.playlistCount,
  profile: mapProfile(user.profile),
  createdAt: user.createdAt.toISOString(),
});
