export interface PostsTable {
  Row: {
    comment_count: number;
    community_id: string | null;
    content: string;
    created_at: string | null;
    downvotes: number | null;
    game_id: string | null;
    id: string;
    score: number;
    sport: string | null;
    title: string;
    upvotes: number | null;
    user_id: string;
  };
  Insert: {
    comment_count?: number;
    community_id?: string | null;
    content: string;
    created_at?: string | null;
    downvotes?: number | null;
    game_id?: string | null;
    id?: string;
    score?: number;
    sport?: string | null;
    title: string;
    upvotes?: number | null;
    user_id: string;
  };
  Update: {
    comment_count?: number;
    community_id?: string | null;
    content?: string;
    created_at?: string | null;
    downvotes?: number | null;
    game_id?: string | null;
    id?: string;
    score?: number;
    sport?: string | null;
    title?: string;
    upvotes?: number | null;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "posts_community_id_fkey";
      columns: ["community_id"];
      isOneToOne: false;
      referencedRelation: "communities";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "posts_game_id_fkey";
      columns: ["game_id"];
      isOneToOne: false;
      referencedRelation: "games";
      referencedColumns: ["id"];
    },
  ];
}

export interface CommentsTable {
  Row: {
    content: string;
    created_at: string | null;
    id: string;
    post_id: string;
    user_id: string;
  };
  Insert: {
    content: string;
    created_at?: string | null;
    id?: string;
    post_id: string;
    user_id: string;
  };
  Update: {
    content?: string;
    created_at?: string | null;
    id?: string;
    post_id?: string;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "comments_post_id_fkey";
      columns: ["post_id"];
      isOneToOne: false;
      referencedRelation: "posts";
      referencedColumns: ["id"];
    },
  ];
}

export interface PostVotesTable {
  Row: {
    created_at: string | null;
    id: string;
    post_id: string;
    user_id: string;
    vote_type: string;
  };
  Insert: {
    created_at?: string | null;
    id?: string;
    post_id: string;
    user_id: string;
    vote_type: string;
  };
  Update: {
    created_at?: string | null;
    id?: string;
    post_id?: string;
    user_id?: string;
    vote_type?: string;
  };
  Relationships: [
    {
      foreignKeyName: "post_votes_post_id_fkey";
      columns: ["post_id"];
      isOneToOne: false;
      referencedRelation: "posts";
      referencedColumns: ["id"];
    },
  ];
}

export interface PostViewsTable {
  Row: {
    created_at: string;
    id: string;
    last_viewed_at: string;
    post_id: string;
    user_id: string;
  };
  Insert: {
    created_at?: string;
    id?: string;
    last_viewed_at?: string;
    post_id: string;
    user_id: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    last_viewed_at?: string;
    post_id?: string;
    user_id?: string;
  };
  Relationships: [
    {
      foreignKeyName: "post_views_post_id_fkey";
      columns: ["post_id"];
      isOneToOne: false;
      referencedRelation: "posts";
      referencedColumns: ["id"];
    },
  ];
}

export type Post = PostsTable["Row"];
export type PostInsert = PostsTable["Insert"];
export type PostUpdate = PostsTable["Update"];

export type Comment = CommentsTable["Row"];
export type CommentInsert = CommentsTable["Insert"];
export type CommentUpdate = CommentsTable["Update"];

export type PostVote = PostVotesTable["Row"];
export type PostVoteInsert = PostVotesTable["Insert"];
export type PostVoteUpdate = PostVotesTable["Update"];

export type PostView = PostViewsTable["Row"];
export type PostViewInsert = PostViewsTable["Insert"];
export type PostViewUpdate = PostViewsTable["Update"];
