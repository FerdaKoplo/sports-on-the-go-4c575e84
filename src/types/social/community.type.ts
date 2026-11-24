import type { CommunityVisibility, SportType } from "../shared/enums.type";

export interface CommunitiesTable {
  Row: {
    archived: boolean;
    archived_at: string | null;
    created_at: string | null;
    created_by: string;
    description: string | null;
    game_id: string | null;
    id: string;
    member_count: number | null;
    name: string;
    sport: SportType | null;
    type: string;
    visibility: CommunityVisibility | null;
  };
  Insert: {
    archived?: boolean;
    archived_at?: string | null;
    created_at?: string | null;
    created_by: string;
    description?: string | null;
    game_id?: string | null;
    id?: string;
    member_count?: number | null;
    name: string;
    sport?: SportType | null;
    type?: string;
    visibility?: CommunityVisibility | null;
  };
  Update: {
    archived?: boolean;
    archived_at?: string | null;
    created_at?: string | null;
    created_by?: string;
    description?: string | null;
    game_id?: string | null;
    id?: string;
    member_count?: number | null;
    name?: string;
    sport?: SportType | null;
    type?: string;
    visibility?: CommunityVisibility | null;
  };
  Relationships: [
    {
      foreignKeyName: "communities_game_id_fkey";
      columns: ["game_id"];
      isOneToOne: false;
      referencedRelation: "games";
      referencedColumns: ["id"];
    },
  ];
}

export interface CommunityMembersTable {
  Row: {
    community_id: string;
    id: string;
    joined_at: string | null;
    role: string;
    user_id: string;
  };
  Insert: {
    community_id: string;
    id?: string;
    joined_at?: string | null;
    role?: string;
    user_id: string;
  };
  Update: {
    community_id?: string;
    id?: string;
    joined_at?: string | null;
    role?: string;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "community_members_community_id_fkey";
      columns: ["community_id"];
      isOneToOne: false;
      referencedRelation: "communities";
      referencedColumns: ["id"];
    },
  ];
}

export type Community = CommunitiesTable["Row"];
export type CommunityInsert = CommunitiesTable["Insert"];
export type CommunityUpdate = CommunitiesTable["Update"];

export type CommunityMember = CommunityMembersTable["Row"];
export type CommunityMemberInsert = CommunityMembersTable["Insert"];
export type CommunityMemberUpdate = CommunityMembersTable["Update"];
