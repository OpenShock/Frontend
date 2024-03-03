import type { RankType } from "$lib/api/internal/v1";

export interface ApiUser {
  id: string;
  name: string;
  avatar: string;
  rank: RankType;
};
export interface ApiUserSelf extends ApiUser {
  email: string;
};
