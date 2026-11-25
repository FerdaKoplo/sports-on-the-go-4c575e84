// behavioral factory => technically all the functions consist of writing operations live there (the handlers)

import { supabase } from "@/integrations/supabase/client";
import type { CommunityVisibility, SportType } from "@/types";

export interface ActionToastPayload {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface CommunityActionResult<T = unknown> {
  success: boolean;
  data?: T;
  toast?: ActionToastPayload;
}

export interface CommunityActionStrategy<T = unknown> {
  execute(): Promise<CommunityActionResult<T>>;
}

export type CommunityActionPayload =
  | {
      type: "create_community";
      userId: string;
      name: string;
      description: string;
      sport: string;
    }
  | { type: "delete_community"; communityId: string }
  | { type: "join_community"; communityId: string; userId: string }
  | { type: "leave_community"; communityId: string; userId: string }
  | {
      type: "update_visibility";
      communityId: string;
      visibility: CommunityVisibility;
    }
  | { type: "kick_member"; memberId: string }
  | {
      type: "create_post";
      userId: string;
      communityId: string;
      title: string;
      content: string;
    }
  | { type: "delete_post"; postId: string }
  | { type: "vote_post"; postId: string; delta: number }
  | { type: "add_comment"; postId: string; userId: string; content: string }
  | { type: "delete_comment"; commentId: string }
  | { type: "delete_comment"; commentId: string; postId: string }
  | { type: "mark_post_viewed"; postId: string; userId: string };

const checkModeration = async (
  content: string,
  blockedTitle: string,
): Promise<ActionToastPayload | null> => {
  const { data } = await supabase.functions.invoke("moderate-content", {
    body: { content },
  });

  if (data?.isFlagged) {
    return {
      title: blockedTitle,
      description: data.reason || "Please keep it respectful.",
      variant: "destructive",
    };
  }
  return null;
};

class CreateCommunityStrategy implements CommunityActionStrategy {
  constructor(
    private readonly params: Extract<
      CommunityActionPayload,
      { type: "create_community" }
    >,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { userId, name, description, sport } = this.params;

    const { data: community, error } = await supabase
      .from("communities")
      .insert({
        name,
        description,
        created_by: userId,
        type: "general",
        sport: sport as SportType,
      })
      .select()
      .single();

    if (error || !community) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to create community.",
          variant: "destructive",
        },
      };
    }

    await supabase.from("community_members").insert({
      community_id: community.id,
      user_id: userId,
      role: "admin",
    });

    return {
      success: true,
      data: community,
      toast: { title: "Community created!" },
    };
  }
}

class DeleteCommunityStrategy implements CommunityActionStrategy {
  constructor(private readonly communityId: string) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", this.communityId);

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to delete community.",
          variant: "destructive",
        },
      };
    }
    return {
      success: true,
      toast: { title: "Community deleted successfully!" },
    };
  }
}

class JoinCommunityStrategy implements CommunityActionStrategy {
  constructor(
    private readonly communityId: string,
    private readonly userId: string,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase.from("community_members").insert({
      community_id: this.communityId,
      user_id: this.userId,
      role: "member",
    });

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error joining community",
          description: error.message || "Failed to join community.",
          variant: "destructive",
        },
      };
    }
    return { success: true, toast: { title: "Joined community!" } };
  }
}

class LeaveCommunityStrategy implements CommunityActionStrategy {
  constructor(
    private readonly communityId: string,
    private readonly userId: string,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", this.communityId)
      .eq("user_id", this.userId);

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to leave community.",
          variant: "destructive",
        },
      };
    }
    return { success: true, toast: { title: "Left community!" } };
  }
}

class UpdateVisibilityStrategy implements CommunityActionStrategy {
  constructor(
    private readonly communityId: string,
    private readonly visibility: CommunityVisibility,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase
      .from("communities")
      .update({ visibility: this.visibility })
      .eq("id", this.communityId);

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to update visibility.",
          variant: "destructive",
        },
      };
    }
    return {
      success: true,
      toast: { title: "Community visibility updated!" },
    };
  }
}

class KickMemberStrategy implements CommunityActionStrategy {
  constructor(private readonly memberId: string) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("id", this.memberId);

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to kick member.",
          variant: "destructive",
        },
      };
    }
    return { success: true, toast: { title: "Member kicked successfully!" } };
  }
}

class CreatePostStrategy implements CommunityActionStrategy {
  constructor(
    private readonly params: Extract<
      CommunityActionPayload,
      { type: "create_post" }
    >,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { userId, communityId, title, content } = this.params;

    const titleFlag = await checkModeration(title, "Post title blocked");
    if (titleFlag) return { success: false, toast: titleFlag };

    const contentFlag = await checkModeration(content, "Post content blocked");
    if (contentFlag) return { success: false, toast: contentFlag };

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      community_id: communityId,
      title,
      content,
    });

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error creating post",
          description: error.message || "Failed to create post.",
          variant: "destructive",
        },
      };
    }
    return { success: true, toast: { title: "Post created!" } };
  }
}

class DeletePostStrategy implements CommunityActionStrategy {
  constructor(private readonly postId: string) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", this.postId);

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to delete post.",
          variant: "destructive",
        },
      };
    }
    return { success: true, toast: { title: "Post deleted successfully!" } };
  }
}

class VotePostStrategy implements CommunityActionStrategy<number> {
  constructor(
    private readonly postId: string,
    private readonly delta: number,
  ) {}

  async execute(): Promise<CommunityActionResult<number>> {
    const { data, error } = await supabase.rpc("adjust_post_score", {
      p_post_id: this.postId,
      p_delta: this.delta,
    });

    if (error) {
      return {
        success: false,
        toast: {
          title: "Vote failed",
          description: "Please try again.",
          variant: "destructive",
        },
      };
    }

    return {
      success: true,
      data,
      toast: {
        title: this.delta > 0 ? "Liked!" : "Disliked!",
        description: `Post score is now ${data}`,
      },
    };
  }
}

class AddCommentStrategy implements CommunityActionStrategy {
  constructor(
    private readonly params: Extract<
      CommunityActionPayload,
      { type: "add_comment" }
    >,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { postId, userId, content } = this.params;

    try {
      const flag = await checkModeration(content, "Comment blocked");
      if (flag) return { success: false, toast: flag };
    } catch {
      // Non-blocking moderation fallback
    }

    const { error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: userId, content })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to add comment.",
          variant: "destructive",
        },
      };
    }

    return { success: true, toast: { title: "Comment added!" } };
  }
}

class DeleteCommentStrategy implements CommunityActionStrategy {
  constructor(private readonly commentId: string) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", this.commentId);

    if (error) {
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to delete comment.",
          variant: "destructive",
        },
      };
    }
    return { success: true, toast: { title: "Comment deleted!" } };
  }
}

class MarkPostViewedStrategy implements CommunityActionStrategy {
  constructor(
    private readonly postId: string,
    private readonly userId: string,
  ) {}

  async execute(): Promise<CommunityActionResult> {
    const { error } = await supabase.from("post_views").upsert(
      {
        post_id: this.postId,
        user_id: this.userId,
        last_viewed_at: new Date().toISOString(),
      },
      { onConflict: "post_id,user_id" },
    );

    return { success: !error };
  }
}

export class CommunityActionFactory {
  static create(payload: CommunityActionPayload): CommunityActionStrategy {
    switch (payload.type) {
      case "create_community":
        return new CreateCommunityStrategy(payload);
      case "delete_community":
        return new DeleteCommunityStrategy(payload.communityId);
      case "join_community":
        return new JoinCommunityStrategy(payload.communityId, payload.userId);
      case "leave_community":
        return new LeaveCommunityStrategy(payload.communityId, payload.userId);
      case "update_visibility":
        return new UpdateVisibilityStrategy(
          payload.communityId,
          payload.visibility,
        );
      case "kick_member":
        return new KickMemberStrategy(payload.memberId);
      case "create_post":
        return new CreatePostStrategy(payload);
      case "delete_post":
        return new DeletePostStrategy(payload.postId);
      case "vote_post":
        return new VotePostStrategy(payload.postId, payload.delta);
      case "add_comment":
        return new AddCommentStrategy(payload);
      case "delete_comment":
        return new DeleteCommentStrategy(payload.commentId);
      case "mark_post_viewed":
        return new MarkPostViewedStrategy(payload.postId, payload.userId);
    }
  }
}
