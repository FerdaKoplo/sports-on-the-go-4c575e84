import type {
  AccountStatus,
  SkillLevel,
  SportType,
} from "../shared/enums.type";
import type { Json } from "../shared/json.type";

export interface ProfilesTable {
  Row: {
    accepted_terms_version: string | null;
    account_status: AccountStatus | null;
    bio: string | null;
    city: string | null;
    created_at: string;
    date_of_birth: string;
    first_name: string | null;
    games_attended: number | null;
    games_hosted: number | null;
    id: string;
    id_verified: boolean | null;
    last_login_at: string | null;
    last_name: string | null;
    latitude: number | null;
    longitude: number | null;
    no_show_count: number | null;
    notification_prefs: Json | null;
    overall_rating: number | null;
    phone_number: string | null;
    phone_verified: boolean | null;
    player_waiver_accepted: boolean | null;
    player_waiver_accepted_at: string | null;
    profile_photo: string | null;
    state: string | null;
    terms_last_accepted_at: string | null;
    total_reviews: number | null;
    updated_at: string;
    username: string | null;
    zip_code: string | null;
  };
  Insert: {
    accepted_terms_version?: string | null;
    account_status?: AccountStatus | null;
    bio?: string | null;
    city?: string | null;
    created_at?: string;
    date_of_birth: string;
    first_name?: string | null;
    games_attended?: number | null;
    games_hosted?: number | null;
    id: string;
    id_verified?: boolean | null;
    last_login_at?: string | null;
    last_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    no_show_count?: number | null;
    notification_prefs?: Json | null;
    overall_rating?: number | null;
    phone_number?: string | null;
    phone_verified?: boolean | null;
    player_waiver_accepted?: boolean | null;
    player_waiver_accepted_at?: string | null;
    profile_photo?: string | null;
    state?: string | null;
    terms_last_accepted_at?: string | null;
    total_reviews?: number | null;
    updated_at?: string;
    username?: string | null;
    zip_code?: string | null;
  };
  Update: {
    accepted_terms_version?: string | null;
    account_status?: AccountStatus | null;
    bio?: string | null;
    city?: string | null;
    created_at?: string;
    date_of_birth?: string;
    first_name?: string | null;
    games_attended?: number | null;
    games_hosted?: number | null;
    id?: string;
    id_verified?: boolean | null;
    last_login_at?: string | null;
    last_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    no_show_count?: number | null;
    notification_prefs?: Json | null;
    overall_rating?: number | null;
    phone_number?: string | null;
    phone_verified?: boolean | null;
    player_waiver_accepted?: boolean | null;
    player_waiver_accepted_at?: string | null;
    profile_photo?: string | null;
    state?: string | null;
    terms_last_accepted_at?: string | null;
    total_reviews?: number | null;
    updated_at?: string;
    username?: string | null;
    zip_code?: string | null;
  };
  Relationships: [];
}

export interface UserSportsTable {
  Row: {
    created_at: string;
    id: string;
    skill_level: SkillLevel;
    sport: SportType;
    user_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    skill_level: SkillLevel;
    sport: SportType;
    user_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    skill_level?: SkillLevel;
    sport?: SportType;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "user_sports_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
}

export type Profile = ProfilesTable["Row"];
export type ProfileInsert = ProfilesTable["Insert"];
export type ProfileUpdate = ProfilesTable["Update"];

export type UserSport = UserSportsTable["Row"];
export type UserSportInsert = UserSportsTable["Insert"];
export type UserSportUpdate = UserSportsTable["Update"];
