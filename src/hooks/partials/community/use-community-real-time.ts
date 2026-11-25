import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/authStore";
import { useCommunityStore } from "@/stores/communityStore";
import { getDisplayName } from "@/components/partials/community/community-types.props";

export const useCommunityRealtime = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const communityId = useCommunityStore((s) => s.selectedCommunity?.id);
  const userId = user?.id;

  useEffect(() => {
    if (!communityId || !userId) return;

    const channel = supabase
      .channel(`community-live-${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          if (payload.new.user_id === userId) return;

          const { data: profile } = await supabase
            .from("profiles")
            .select("username, first_name, last_name")
            .eq("id", payload.new.user_id)
            .maybeSingle();

          toast({
            title: "New post in community",
            description: `${getDisplayName(profile)} posted: "${payload.new.title}"`,
          });

          void useCommunityStore.getState().fetchPosts(communityId, userId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `community_id=eq.${communityId}`,
        },
        (payload) => {
          useCommunityStore.getState().updatePostMetrics(payload.new.id, {
            score: payload.new.score,
            comment_count: payload.new.comment_count,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        async (payload) => {
          const commentPostId = payload.new.post_id as string;
          if (payload.new.user_id === userId) return;

          const state = useCommunityStore.getState();
          const targetPost = state.posts.find((p) => p.id === commentPostId);
          if (!targetPost) return;

          if (state.selectedPostId === commentPostId) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, first_name, last_name")
              .eq("id", payload.new.user_id)
              .maybeSingle();

            toast({
              title: "New comment",
              description: `${getDisplayName(profile)} replied to "${targetPost.title}"`,
            });

            void state.fetchComments(commentPostId);
          } else {
            state.incrementUnreadCount(commentPostId);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [communityId, userId, toast]);
};
