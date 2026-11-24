import type { FriendshipStatus } from "../shared/enums.type";

export interface FriendshipsTable {
  Row: {
    addressee_id: string;
    created_at: string;
    id: string;
    requester_id: string;
    status: FriendshipStatus;
    updated_at: string;
  };
  Insert: {
    addressee_id: string;
    created_at?: string;
    id?: string;
    requester_id: string;
    status?: FriendshipStatus;
    updated_at?: string;
  };
  Update: {
    addressee_id?: string;
    created_at?: string;
    id?: string;
    requester_id?: string;
    status?: FriendshipStatus;
    updated_at?: string;
  };
  Relationships: [];
}

export type Friendship = FriendshipsTable["Row"];
export type FriendshipInsert = FriendshipsTable["Insert"];
export type FriendshipUpdate = FriendshipsTable["Update"];
