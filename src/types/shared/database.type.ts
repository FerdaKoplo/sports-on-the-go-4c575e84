import type {
  AccountStatus,
  AppRole,
  CommunityVisibility,
  FriendshipStatus,
  GameStatus,
  GameVisibility,
  RsvpStatus,
  SkillLevel,
  SportType,
  UserRole,
} from "./enums.type";
import type {
  CommunitiesTable,
  CommunityMembersTable,
} from "../social/community.type";
import type { FriendshipsTable } from "../social/friendship.type";
import type {
  CommentsTable,
  PostsTable,
  PostViewsTable,
  PostVotesTable,
} from "../social/post.type";
import type {
  GamesTable,
  ReviewsTable,
  RsvpsTable,
  SavedGamesTable,
} from "../tables/game.type";
import type { NotificationsTable } from "../tables/notification.type";
import type { ProfilesTable, UserSportsTable } from "../user/profile.type";
import type { UserRolesTable } from "../user/role.type";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      comments: CommentsTable;
      communities: CommunitiesTable;
      community_members: CommunityMembersTable;
      friendships: FriendshipsTable;
      games: GamesTable;
      notifications: NotificationsTable;
      post_views: PostViewsTable;
      post_votes: PostVotesTable;
      posts: PostsTable;
      profiles: ProfilesTable;
      reviews: ReviewsTable;
      rsvps: RsvpsTable;
      saved_games: SavedGamesTable;
      user_roles: UserRolesTable;
      user_sports: UserSportsTable;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      adjust_post_score: {
        Args: { p_delta: number; p_post_id: string };
        Returns: number;
      };
      get_friendship_status: {
        Args: { user_id_1: string; user_id_2: string };
        Returns: FriendshipStatus;
      };
      get_mutual_friends_count: {
        Args: { user_id_1: string; user_id_2: string };
        Returns: number;
      };
      has_role: {
        Args: {
          _role: AppRole;
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      account_status: AccountStatus;
      app_role: AppRole;
      community_visibility: CommunityVisibility;
      friendship_status: FriendshipStatus;
      game_status: GameStatus;
      game_visibility: GameVisibility;
      rsvp_status: RsvpStatus;
      skill_level: SkillLevel;
      sport_type: SportType;
      user_role: UserRole;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
