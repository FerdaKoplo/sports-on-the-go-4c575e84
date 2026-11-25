import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GAME_SELECT_QUERY, useDiscoverStore } from "@/stores/discoverStore";
import {
  transformDbGame,
  type RawDbGame,
} from "@/components/partials/discover/discover-types.props";

export const useGamesRealtime = () => {
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndTransform = async (gameId: string) => {
      const { data, error } = await supabase
        .from("games")
        .select(GAME_SELECT_QUERY)
        .eq("id", gameId)
        .single();

      if (error || !data) return null;
      return transformDbGame(data as unknown as RawDbGame);
    };

    const channel = supabase
      .channel("games-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "games" },
        async (payload) => {
          const game = await fetchAndTransform(payload.new.id);
          if (!game) return;

          useDiscoverStore.getState().upsertGame(game);
          toast({
            title: "🎮 New game available!",
            description: `${game.sport} at ${game.location}`,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        async (payload) => {
          const game = await fetchAndTransform(payload.new.id);
          if (!game) return;

          useDiscoverStore.getState().upsertGame(game);
          toast({
            title: "📝 Game updated",
            description: `${game.sport} at ${game.location}`,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "games" },
        (payload) => {
          const deleted = useDiscoverStore
            .getState()
            .removeGame(payload.old.id);
          if (deleted) {
            toast({
              title: "🗑️ Game cancelled",
              description: `${deleted.sport} at ${deleted.location} has been cancelled`,
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [toast]);
};
