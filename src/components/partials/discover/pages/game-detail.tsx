import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Share2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareGameButton } from "@/components/ShareGameButton";
import { ExternalMapFactory } from "@/constants/factory/discover/discover-action-factory";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/authStore";
import { useDiscoverStore } from "@/stores/discoverStore";
import {
  calculateDistance,
  isGameInPast,
  type DiscoverGame,
} from "../discover-types.props";

type JoinStateType = "is_host" | "already_joined" | "past_game" | "can_join";

interface JoinActionContext {
  isJoining: boolean;
  onJoin: () => void;
}

const JOIN_STATE_REGISTRY: Record<
  JoinStateType,
  (ctx: JoinActionContext) => ReactNode
> = {
  is_host: () => (
    <div className="flex-1">
      <Badge variant="secondary" className="w-full justify-center py-3 mb-2">
        You&apos;re hosting this game
      </Badge>
      <p className="text-sm text-center text-muted-foreground">
        Hosts cannot join their own games
      </p>
    </div>
  ),
  already_joined: () => (
    <div className="flex-1">
      <Badge variant="secondary" className="w-full justify-center py-3 mb-2">
        ✓ You&apos;re in!
      </Badge>
      <p className="text-sm text-center text-muted-foreground">
        You&apos;ve already joined this game
      </p>
    </div>
  ),
  past_game: () => (
    <div className="flex-1">
      <Badge variant="outline" className="w-full justify-center py-3 mb-2">
        Game has ended
      </Badge>
      <p className="text-sm text-center text-muted-foreground">
        This game has already started or ended
      </p>
    </div>
  ),
  can_join: ({ isJoining, onJoin }) => (
    <Button
      onClick={onJoin}
      disabled={isJoining}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      {isJoining ? "Joining..." : "Join Game"}
    </Button>
  ),
};

class JoinActionFactory {
  static resolveState(
    game: DiscoverGame,
    userId: string | undefined,
    userRSVPs: Set<string>,
  ): JoinStateType {
    if (userId && game.hostId === userId) return "is_host";
    if (userRSVPs.has(game.id)) return "already_joined";
    if (isGameInPast(game)) return "past_game";
    return "can_join";
  }

  static create(type: JoinStateType, ctx: JoinActionContext): ReactNode {
    return JOIN_STATE_REGISTRY[type](ctx);
  }
}

interface GameDetailPanelProps {
  game: DiscoverGame;
  isSaved: boolean;
  onToggleSave: (gameId: string) => void;
  onBack: () => void;
}

export const GameDetailPanel = ({
  game,
  isSaved,
  onToggleSave,
  onBack,
}: GameDetailPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userLocation, userRSVPs, joiningGameId, dispatchAction } =
    useDiscoverStore();

  const joinState = JoinActionFactory.resolveState(game, user?.id, userRSVPs);

  const handleJoin = async () => {
    const res = await dispatchAction({
      type: "join_game",
      game,
      userId: user?.id,
      alreadyJoined: userRSVPs.has(game.id),
    });

    if (res.toast) toast(res.toast);
    if (res.requiresAuth) navigate("/auth");
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-4xl mb-2">{game.emoji}</div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{game.sport}</h2>
            {isSaved && (
              <Badge
                variant="secondary"
                className="text-xs bg-amber-100 text-amber-700 border-amber-300"
              >
                <Bookmark className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            {game.location}
          </div>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
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

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-xs text-gray-500">Date</div>
            <div className="font-semibold text-gray-900">{game.date}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-xs text-gray-500">Time</div>
            <div className="font-semibold text-gray-900">{game.time}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Users className="w-5 h-5 text-gray-600" />
          <div>
            <div className="text-xs text-gray-500">Players</div>
            <div className="font-semibold text-gray-900">
              {game.players.current}/{game.players.max}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <div className="text-xs text-gray-500 mb-1">Skill Level</div>
          <Badge className="bg-green-100 text-green-700 border-green-300">
            {game.skillLevel}
          </Badge>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-700 mb-2">
          <span className="font-semibold">Host:</span> {game.hostName}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-semibold text-gray-900">{game.hostRating}</span>
          <span className="text-sm text-gray-500">/5.0</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
          <Share2 className="w-3 h-3" />
          <span className="font-semibold">Open location in:</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => ExternalMapFactory.create("apple").open(game)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Apple Maps
          </Button>
          <Button
            onClick={() => ExternalMapFactory.create("google").open(game)}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Google Maps
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {JoinActionFactory.create(joinState, {
          isJoining: joiningGameId === game.id,
          onJoin: handleJoin,
        })}

        <Button
          onClick={() => onToggleSave(game.id)}
          variant="outline"
          size="lg"
          className="px-3"
          title={isSaved ? "Remove from saved" : "Save for later"}
        >
          {isSaved ? (
            <BookmarkCheck className="w-5 h-5 text-primary" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </Button>

        <ShareGameButton
          gameId={game.id.toString()}
          gameName={`${game.sport} Game`}
          size="lg"
        />
      </div>

      <button
        onClick={onBack}
        className="w-full mt-3 text-sm text-gray-600 hover:text-gray-900 font-medium"
      >
        ← Back to all games
      </button>
    </div>
  );
};
