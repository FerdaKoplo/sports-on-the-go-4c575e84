export interface NotificationsTable {
  Row: {
    action_url: string | null;
    created_at: string;
    id: string;
    is_read: boolean;
    message: string;
    related_community_id: string | null;
    related_friendship_id: string | null;
    related_game_id: string | null;
    related_post_id: string | null;
    related_user_id: string | null;
    title: string;
    type: string;
    user_id: string;
  };
  Insert: {
    action_url?: string | null;
    created_at?: string;
    id?: string;
    is_read?: boolean;
    message: string;
    related_community_id?: string | null;
    related_friendship_id?: string | null;
    related_game_id?: string | null;
    related_post_id?: string | null;
    related_user_id?: string | null;
    title: string;
    type: string;
    user_id: string;
  };
  Update: {
    action_url?: string | null;
    created_at?: string;
    id?: string;
    is_read?: boolean;
    message?: string;
    related_community_id?: string | null;
    related_friendship_id?: string | null;
    related_game_id?: string | null;
    related_post_id?: string | null;
    related_user_id?: string | null;
    title?: string;
    type?: string;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "notifications_related_friendship_id_fkey";
      columns: ["related_friendship_id"];
      isOneToOne: false;
      referencedRelation: "friendships";
      referencedColumns: ["id"];
    },
  ];
}

export type Notification = NotificationsTable["Row"];
export type NotificationInsert = NotificationsTable["Insert"];
export type NotificationUpdate = NotificationsTable["Update"];
