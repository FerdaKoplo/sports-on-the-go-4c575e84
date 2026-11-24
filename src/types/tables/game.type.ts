import type {
  GameStatus,
  GameVisibility,
  RsvpStatus,
  SkillLevel,
  SportType,
} from "../shared/enums.type";

export interface GamesTable {
  Row: {
    address: string;
    city: string;
    country: string;
    created_at: string;
    current_players: number | null;
    custom_emoji: string | null;
    custom_sport_name: string | null;
    description: string | null;
    duration_minutes: number;
    equipment_requirements: string | null;
    game_date: string;
    game_rules: string | null;
    host_id: string;
    id: string;
    is_recurring: boolean | null;
    latitude: number;
    location_name: string;
    longitude: number;
    max_players: number;
    skill_level: SkillLevel;
    sport: SportType;
    start_time: string;
    state: string | null;
    status: GameStatus | null;
    updated_at: string;
    visibility: GameVisibility | null;
    zip_code: string | null;
  };
  Insert: {
    address: string;
    city: string;
    country?: string;
    created_at?: string;
    current_players?: number | null;
    custom_emoji?: string | null;
    custom_sport_name?: string | null;
    description?: string | null;
    duration_minutes: number;
    equipment_requirements?: string | null;
    game_date: string;
    game_rules?: string | null;
    host_id: string;
    id?: string;
    is_recurring?: boolean | null;
    latitude: number;
    location_name: string;
    longitude: number;
    max_players: number;
    skill_level: SkillLevel;
    sport: SportType;
    start_time: string;
    state?: string | null;
    status?: GameStatus | null;
    updated_at?: string;
    visibility?: GameVisibility | null;
    zip_code?: string | null;
  };
  Update: {
    address?: string;
    city?: string;
    country?: string;
    created_at?: string;
    current_players?: number | null;
    custom_emoji?: string | null;
    custom_sport_name?: string | null;
    description?: string | null;
    duration_minutes?: number;
    equipment_requirements?: string | null;
    game_date?: string;
    game_rules?: string | null;
    host_id?: string;
    id?: string;
    is_recurring?: boolean | null;
    latitude?: number;
    location_name?: string;
    longitude?: number;
    max_players?: number;
    skill_level?: SkillLevel;
    sport?: SportType;
    start_time?: string;
    state?: string | null;
    status?: GameStatus | null;
    updated_at?: string;
    visibility?: GameVisibility | null;
    zip_code?: string | null;
  };
  Relationships: [
    {
      foreignKeyName: "games_host_id_fkey";
      columns: ["host_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
}

export interface RsvpsTable {
  Row: {
    attended: boolean | null;
    cancelled_at: string | null;
    game_id: string;
    id: string;
    marked_no_show: boolean | null;
    rsvp_at: string;
    status: RsvpStatus;
    user_id: string;
    waitlist_position: number | null;
  };
  Insert: {
    attended?: boolean | null;
    cancelled_at?: string | null;
    game_id: string;
    id?: string;
    marked_no_show?: boolean | null;
    rsvp_at?: string;
    status?: RsvpStatus;
    user_id: string;
    waitlist_position?: number | null;
  };
  Update: {
    attended?: boolean | null;
    cancelled_at?: string | null;
    game_id?: string;
    id?: string;
    marked_no_show?: boolean | null;
    rsvp_at?: string;
    status?: RsvpStatus;
    user_id?: string;
    waitlist_position?: number | null;
  };
  Relationships: [
    {
      foreignKeyName: "rsvps_game_id_fkey";
      columns: ["game_id"];
      isOneToOne: false;
      referencedRelation: "games";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "rsvps_user_id_fkey";
      columns: ["user_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
}

export interface SavedGamesTable {
  Row: {
    created_at: string;
    game_id: string;
    id: string;
    user_id: string;
  };
  Insert: {
    created_at?: string;
    game_id: string;
    id?: string;
    user_id: string;
  };
  Update: {
    created_at?: string;
    game_id?: string;
    id?: string;
    user_id?: string;
  };
  Relationships: [];
}

export interface ReviewsTable {
  Row: {
    comment: string | null;
    created_at: string;
    game_id: string;
    good_sportsmanship: number | null;
    id: string;
    is_anonymous: boolean | null;
    overall_rating: number | null;
    reviewee_id: string;
    reviewer_id: string;
    showed_up_on_time: number | null;
    skill_accurate: number | null;
    would_play_again: number | null;
  };
  Insert: {
    comment?: string | null;
    created_at?: string;
    game_id: string;
    good_sportsmanship?: number | null;
    id?: string;
    is_anonymous?: boolean | null;
    overall_rating?: number | null;
    reviewee_id: string;
    reviewer_id: string;
    showed_up_on_time?: number | null;
    skill_accurate?: number | null;
    would_play_again?: number | null;
  };
  Update: {
    comment?: string | null;
    created_at?: string;
    game_id?: string;
    good_sportsmanship?: number | null;
    id?: string;
    is_anonymous?: boolean | null;
    overall_rating?: number | null;
    reviewee_id?: string;
    reviewer_id?: string;
    showed_up_on_time?: number | null;
    skill_accurate?: number | null;
    would_play_again?: number | null;
  };
  Relationships: [
    {
      foreignKeyName: "reviews_game_id_fkey";
      columns: ["game_id"];
      isOneToOne: false;
      referencedRelation: "games";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "reviews_reviewee_id_fkey";
      columns: ["reviewee_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "reviews_reviewer_id_fkey";
      columns: ["reviewer_id"];
      isOneToOne: false;
      referencedRelation: "profiles";
      referencedColumns: ["id"];
    },
  ];
}

export type Game = GamesTable["Row"];
export type GameInsert = GamesTable["Insert"];
export type GameUpdate = GamesTable["Update"];

export type Rsvp = RsvpsTable["Row"];
export type RsvpInsert = RsvpsTable["Insert"];
export type RsvpUpdate = RsvpsTable["Update"];

export type SavedGame = SavedGamesTable["Row"];
export type SavedGameInsert = SavedGamesTable["Insert"];
export type SavedGameUpdate = SavedGamesTable["Update"];

export type Review = ReviewsTable["Row"];
export type ReviewInsert = ReviewsTable["Insert"];
export type ReviewUpdate = ReviewsTable["Update"];
