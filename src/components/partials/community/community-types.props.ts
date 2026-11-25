import type {
  Comment as BaseComment,
  Community as BaseCommunity,
  CommunityMember as BaseCommunityMember,
  Post as BasePost,
} from "@/types";

export interface AuthorProfile {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
}

export type CommunityItem = BaseCommunity;

export interface PostItem extends BasePost {
  unreadCount?: number;
  profiles: AuthorProfile;
}

export interface CommentItem extends BaseComment {
  profiles: AuthorProfile;
}

export interface CommunityMemberItem extends BaseCommunityMember {
  profiles: AuthorProfile;
}

export function getDisplayName(
  profile?: Partial<AuthorProfile> | null,
  userId?: string,
): string {
  const uname = (profile?.username || "").trim();
  if (uname) return uname;

  const full = [profile?.first_name, profile?.last_name]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(" ");
  if (full) return full;

  return userId ? `User-${userId.slice(0, 6)}` : "Member";
}
