import {
  isGameInPast,
  type DiscoverGame,
} from "@/components/partials/discover/discover-types.props";
import { supabase } from "@/integrations/supabase/client";

export interface DiscoverToastPayload {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface DiscoverActionResult {
  success: boolean;
  requiresAuth?: boolean;
  markAsJoined?: boolean;
  toast?: DiscoverToastPayload;
}

export interface DiscoverActionStrategy {
  execute(): Promise<DiscoverActionResult>;
}

export type DiscoverActionPayload = {
  type: "join_game";
  game: DiscoverGame;
  userId?: string;
  alreadyJoined: boolean;
};

class JoinGameStrategy implements DiscoverActionStrategy {
  constructor(
    private readonly params: Extract<
      DiscoverActionPayload,
      { type: "join_game" }
    >,
  ) {}

  async execute(): Promise<DiscoverActionResult> {
    const { game, userId, alreadyJoined } = this.params;

    if (!userId) {
      return {
        success: false,
        requiresAuth: true,
        toast: {
          title: "Authentication required",
          description: "Please log in to join a game.",
          variant: "destructive",
        },
      };
    }

    if (game.hostId === userId) {
      return {
        success: false,
        toast: {
          title: "Cannot join",
          description: "You cannot join a game you are hosting.",
          variant: "destructive",
        },
      };
    }

    if (alreadyJoined) {
      return {
        success: false,
        toast: {
          title: "Already joined",
          description: "You've already joined this game.",
          variant: "destructive",
        },
      };
    }

    if (isGameInPast(game)) {
      return {
        success: false,
        toast: {
          title: "Game has passed",
          description:
            "You cannot join a game that has already started or ended.",
          variant: "destructive",
        },
      };
    }

    try {
      const { error } = await supabase.from("rsvps").insert({
        game_id: game.id,
        user_id: userId,
        status: "CONFIRMED",
      });

      if (error) {
        if (error.code === "23505") {
          return {
            success: false,
            markAsJoined: true,
            toast: {
              title: "Already joined",
              description: "You've already joined this game.",
              variant: "destructive",
            },
          };
        }
        if (error.message?.includes("policy")) {
          return {
            success: false,
            toast: {
              title: "Cannot join",
              description: "You cannot join a game you are hosting.",
              variant: "destructive",
            },
          };
        }
        throw error;
      }

      const { data: communityData } = await supabase
        .from("communities")
        .select("id")
        .eq("game_id", game.id)
        .eq("type", "game")
        .maybeSingle();

      if (communityData) {
        await supabase.from("community_members").insert({
          community_id: communityData.id,
          user_id: userId,
          role: "member",
        });
      }

      return {
        success: true,
        markAsJoined: true,
        toast: {
          title: "Successfully joined!",
          description:
            "You're confirmed for this game and added to its community.",
        },
      };
    } catch (error) {
      console.error("Error joining game:", error);
      return {
        success: false,
        toast: {
          title: "Error",
          description: "Failed to join game. Please try again.",
          variant: "destructive",
        },
      };
    }
  }
}

export class DiscoverActionFactory {
  static create(payload: DiscoverActionPayload): DiscoverActionStrategy {
    switch (payload.type) {
      case "join_game":
        return new JoinGameStrategy(payload);
    }
  }
}

// --- External Navigation Provider Factory ---

export type ExternalMapProvider = "apple" | "google";

interface ExternalMapStrategy {
  open(game: DiscoverGame): void;
}

const EXTERNAL_MAP_STRATEGIES: Record<
  ExternalMapProvider,
  ExternalMapStrategy
> = {
  apple: {
    open: (game) => {
      const url = `https://maps.apple.com/?q=${encodeURIComponent(game.location)}&ll=${game.lat},${game.lng}`;
      window.open(url, "_blank");
    },
  },
  google: {
    open: (game) => {
      const url = `https://www.google.com/maps/search/?api=1&query=${game.lat},${game.lng}`;
      window.open(url, "_blank");
    },
  },
};

export class ExternalMapFactory {
  static create(provider: ExternalMapProvider): ExternalMapStrategy {
    return EXTERNAL_MAP_STRATEGIES[provider];
  }
}
