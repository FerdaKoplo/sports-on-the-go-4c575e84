import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  DiscoverActionFactory,
  type DiscoverActionPayload,
  type DiscoverActionResult,
} from "@/constants/factory/discover/discover-action-factory";
import {
  SAMPLE_GAMES,
  transformDbGame,
  type DiscoverGame,
  type RawDbGame,
  type SavedGamesFilterMode,
} from "@/components/partials/discover/discover-types.props";

export const GAME_SELECT_QUERY = `
  id,
  sport,
  custom_sport_name,
  custom_emoji,
  location_name,
  address,
  city,
  game_date,
  start_time,
  max_players,
  current_players,
  skill_level,
  latitude,
  longitude,
  host_id,
  visibility,
  profiles!games_host_id_fkey(username)
`;

interface DiscoverState {
  dbGames: DiscoverGame[];
  loading: boolean;
  selectedGame: DiscoverGame | null;
  userLocation: [number, number] | null;
  selectedSports: string[];
  hideMyGames: boolean;
  savedGamesFilter: SavedGamesFilterMode;
  userRSVPs: Set<string>;
  userHostedGames: Set<string>;
  joiningGameId: string | null;

  setSelectedGame: (game: DiscoverGame | null) => void;
  setUserLocation: (coords: [number, number] | null) => void;
  setSelectedSports: (sports: string[]) => void;
  toggleSportFilter: (sport: string) => void;
  setHideMyGames: (hide: boolean) => void;
  setSavedGamesFilter: (filter: SavedGamesFilterMode) => void;

  fetchGames: () => Promise<void>;
  fetchUserGameRelations: (userId: string) => Promise<void>;
  upsertGame: (game: DiscoverGame) => void;
  removeGame: (gameId: string) => DiscoverGame | undefined;

  dispatchAction: (
    payload: DiscoverActionPayload,
  ) => Promise<DiscoverActionResult>;
}

type StoreSet = (
  partial:
    Partial<DiscoverState> | ((state: DiscoverState) => Partial<DiscoverState>),
) => void;
type StoreGet = () => DiscoverState;

type ActionSyncMap = {
  [K in DiscoverActionPayload["type"]]?: (
    payload: Extract<DiscoverActionPayload, { type: K }>,
    result: DiscoverActionResult,
    store: { get: StoreGet; set: StoreSet },
  ) => void;
};

const ACTION_SYNC_HANDLERS: ActionSyncMap = {
  join_game: (payload, result, { set }) => {
    if (result.markAsJoined) {
      set((state) => ({
        userRSVPs: new Set([...state.userRSVPs, payload.game.id]),
      }));
    }
  },
};

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  dbGames: [],
  loading: true,
  selectedGame: null,
  userLocation: null,
  selectedSports: [],
  hideMyGames: false,
  savedGamesFilter: "all",
  userRSVPs: new Set(),
  userHostedGames: new Set(),
  joiningGameId: null,

  setSelectedGame: (selectedGame) => set({ selectedGame }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setSelectedSports: (selectedSports) => set({ selectedSports }),
  toggleSportFilter: (sport) =>
    set((state) => ({
      selectedSports: state.selectedSports.includes(sport)
        ? state.selectedSports.filter((s) => s !== sport)
        : [...state.selectedSports, sport],
    })),
  setHideMyGames: (hideMyGames) => set({ hideMyGames }),
  setSavedGamesFilter: (savedGamesFilter) => set({ savedGamesFilter }),

  fetchGames: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("games")
        .select(GAME_SELECT_QUERY)
        .eq("status", "UPCOMING")
        .order("game_date", { ascending: true });

      if (error) throw error;

      const transformed = ((data as unknown as RawDbGame[]) || []).map(
        transformDbGame,
      );
      set({ dbGames: transformed });
    } catch (error) {
      console.error("Error fetching games:", error);
      toast({
        title: "Error loading games",
        description: "Could not load games from database",
        variant: "destructive",
      });
      set({ dbGames: SAMPLE_GAMES });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserGameRelations: async (userId) => {
    const [{ data: rsvpData }, { data: hostedData }] = await Promise.all([
      supabase
        .from("rsvps")
        .select("game_id")
        .eq("user_id", userId)
        .eq("status", "CONFIRMED"),
      supabase.from("games").select("id").eq("host_id", userId),
    ]);

    set({
      userRSVPs: new Set(rsvpData?.map((r) => r.game_id) ?? []),
      userHostedGames: new Set(hostedData?.map((g) => g.id) ?? []),
    });
  },

  upsertGame: (game) =>
    set((state) => {
      const exists = state.dbGames.some((g) => g.id === game.id);
      return {
        dbGames: exists
          ? state.dbGames.map((g) => (g.id === game.id ? game : g))
          : [...state.dbGames, game],
        selectedGame:
          state.selectedGame?.id === game.id ? game : state.selectedGame,
      };
    }),

  removeGame: (gameId) => {
    const deleted = get().dbGames.find((g) => g.id === gameId);
    set((state) => ({
      dbGames: state.dbGames.filter((g) => g.id !== gameId),
      selectedGame:
        state.selectedGame?.id === gameId ? null : state.selectedGame,
    }));
    return deleted;
  },

  dispatchAction: async (payload) => {
    if (payload.type === "join_game") {
      set({ joiningGameId: payload.game.id });
    }

    try {
      const strategy = DiscoverActionFactory.create(payload);
      const result = await strategy.execute();

      const syncHandler = ACTION_SYNC_HANDLERS[payload.type];
      if (syncHandler) {
        syncHandler(payload, result, { get, set });
      }

      return result;
    } finally {
      if (payload.type === "join_game") {
        set({ joiningGameId: null });
      }
    }
  },
}));
