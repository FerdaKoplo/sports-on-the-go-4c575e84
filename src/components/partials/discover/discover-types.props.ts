import type { GameVisibility, SkillLevel, SportType } from "@/types";
import { formatSportDisplay, getSportEmoji } from "@/utils/sportsUtils";

export interface DiscoverGame {
  id: string;
  sport: string;
  rawSport: string;
  emoji: string;
  location: string;
  address: string;
  date: string;
  time: string;
  distance: string;
  players: { current: number; max: number };
  skillLevel: string;
  hostName: string;
  hostRating: number;
  price: string;
  lat: number;
  lng: number;
  visibility: string;
  hostId: string;
  rawGameDate?: string;
  rawStartTime?: string;
  customSportName?: string | null;
}

export type SavedGamesFilterMode = "all" | "only-saved" | "hide-saved";

export interface RawDbGame {
  id: string;
  sport: SportType;
  custom_sport_name: string | null;
  custom_emoji?: string | null;
  location_name: string;
  address: string;
  city: string;
  game_date: string;
  start_time: string;
  max_players: number;
  current_players: number | null;
  skill_level: SkillLevel;
  latitude: number;
  longitude: number;
  host_id: string;
  visibility: GameVisibility | null;
  profiles: { username: string | null } | null;
}

export const transformDbGame = (game: RawDbGame): DiscoverGame => {
  return {
    id: game.id,
    sport: formatSportDisplay(game.sport, game.custom_sport_name),
    rawSport: game.sport,
    emoji: getSportEmoji(game.sport, game.custom_emoji),
    location: game.location_name,
    address: `${game.address}, ${game.city}`,
    date: new Date(game.game_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: new Date(`2000-01-01T${game.start_time}`).toLocaleTimeString(
      "en-US",
      { hour: "numeric", minute: "2-digit" },
    ),
    distance: "0 mi",
    players: { current: game.current_players ?? 0, max: game.max_players },
    skillLevel: game.skill_level.replace("_", " "),
    hostName: game.profiles?.username || "Unknown",
    hostRating: 4.5,
    price: "Free",
    lat: Number(game.latitude),
    lng: Number(game.longitude),
    visibility: game.visibility ?? "PUBLIC",
    hostId: game.host_id,
    rawGameDate: game.game_date,
    rawStartTime: game.start_time,
    customSportName: game.custom_sport_name,
  };
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): string => {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return `${(R * c).toFixed(1)} mi`;
};

export const isGameInPast = (game: DiscoverGame): boolean => {
  if (!game.rawGameDate || !game.rawStartTime) return false;
  return new Date(`${game.rawGameDate}T${game.rawStartTime}`) < new Date();
};

export const filterDiscoverGames = (
  games: DiscoverGame[],
  params: {
    selectedSports: string[];
    hideMyGames: boolean;
    savedGamesFilter: SavedGamesFilterMode;
    userId?: string;
    userRSVPs: Set<string>;
    userHostedGames: Set<string>;
    savedGameIds: Set<string>;
  },
): DiscoverGame[] => {
  const {
    selectedSports,
    hideMyGames,
    savedGamesFilter,
    userId,
    userRSVPs,
    userHostedGames,
    savedGameIds,
  } = params;

  return games.filter((game) => {
    if (isGameInPast(game)) return false;

    if (selectedSports.length > 0 && !selectedSports.includes(game.rawSport)) {
      return false;
    }

    if (
      game.visibility === "FRIENDS_ONLY" ||
      game.visibility === "INVITE_ONLY"
    ) {
      if (!userId) return false;
      if (game.hostId !== userId && !userRSVPs.has(game.id)) return false;
    }

    if (hideMyGames && userId) {
      if (userHostedGames.has(game.id) || userRSVPs.has(game.id)) return false;
    }

    if (userId) {
      if (savedGamesFilter === "only-saved" && !savedGameIds.has(game.id)) {
        return false;
      }
      if (savedGamesFilter === "hide-saved" && savedGameIds.has(game.id)) {
        return false;
      }
    }

    return true;
  });
};

export const SAMPLE_GAMES: DiscoverGame[] = [
  {
    id: "1",
    sport: "Basketball",
    rawSport: "BASKETBALL",
    emoji: "🏀",
    location: "Mission Playground",
    address: "19th & Valencia, San Francisco, CA",
    date: "Oct 15",
    time: "6:00 PM",
    distance: "2.3 mi",
    players: { current: 8, max: 10 },
    skillLevel: "Intermediate",
    hostName: "John D.",
    hostRating: 4.8,
    price: "Free",
    lat: 37.7599,
    lng: -122.4219,
    visibility: "PUBLIC",
    hostId: "sample-host-1",
  },
  {
    id: "2",
    sport: "Soccer",
    rawSport: "SOCCER",
    emoji: "⚽",
    location: "Central Park",
    address: "Great Lawn, New York, NY",
    date: "Oct 16",
    time: "5:00 PM",
    distance: "3.1 mi",
    players: { current: 14, max: 20 },
    skillLevel: "All Levels",
    hostName: "Maria S.",
    hostRating: 4.9,
    price: "$5",
    lat: 40.7829,
    lng: -73.9654,
    visibility: "PUBLIC",
    hostId: "sample-host-2",
  },
  {
    id: "3",
    sport: "Tennis",
    rawSport: "TENNIS",
    emoji: "🎾",
    location: "Griffith Park",
    address: "Los Angeles, CA",
    date: "Oct 17",
    time: "7:00 AM",
    distance: "1.8 mi",
    players: { current: 3, max: 4 },
    skillLevel: "Advanced",
    hostName: "Alex K.",
    hostRating: 4.7,
    price: "Free",
    lat: 34.1365,
    lng: -118.2942,
    visibility: "PUBLIC",
    hostId: "sample-host-3",
  },
];
