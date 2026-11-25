import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDiscoverStore } from "@/stores/discoverStore";
import { calculateDistance, type DiscoverGame } from "../discover-types.props";

interface NearbyGamesListProps {
  games: DiscoverGame[];
  isSaved: (gameId: string) => boolean;
  onSelectGame: (game: DiscoverGame) => void;
}

export const NearbyGamesList = ({
  games,
  isSaved,
  onSelectGame,
}: NearbyGamesListProps) => {
  const userLocation = useDiscoverStore((s) => s.userLocation);

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Nearby Games</h3>
      <div className="space-y-3">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game)}
            className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{game.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    {game.sport}
                    {isSaved(game.id) && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-amber-100 text-amber-700 border-amber-300"
                      >
                        <Bookmark className="w-3 h-3 mr-1" />
                        Saved
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{game.location}</div>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                {userLocation
                  ? calculateDistance(
                      userLocation[0],
                      userLocation[1],
                      game.lat,
                      game.lng,
                    )
                  : game.distance}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {game.date} • {game.time}
              </span>
              <span>
                {game.players.current}/{game.players.max} players
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
