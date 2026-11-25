import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { GameReminderBanner } from "@/components/GameReminderBanner";
import { Navbar } from "@/components/shared/nav/nav";
import { useGamesRealtime } from "@/hooks/partials/discover/use-games-realtime";
import { useLeafletMap } from "@/hooks/partials/discover/use-leaflet-map";
import { useSavedGames } from "@/hooks/useSavedGames";
import { useAuth } from "@/stores/authStore";
import { useDiscoverStore } from "@/stores/discoverStore";
import {
  DiscoverGame,
  filterDiscoverGames,
} from "@/components/partials/discover/discover-types.props";
import { DiscoverFilterBar } from "@/components/partials/discover/filter/filter-bar";
import { DiscoverPanelFactory } from "@/constants/factory/discover/discover-view-factory";

interface DiscoverProps {
  games?: DiscoverGame[];
  center?: [number, number];
  zoom?: number;
}

const Discover = ({
  games: propGames,
  center: propCenter,
  zoom = 4,
}: DiscoverProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { savedGameIds, toggleSaveGame, isSaved } = useSavedGames(user?.id);

  const {
    dbGames,
    loading,
    selectedGame,
    selectedSports,
    hideMyGames,
    savedGamesFilter,
    userRSVPs,
    userHostedGames,
    setSelectedGame,
    setSelectedSports,
    fetchGames,
    fetchUserGameRelations,
  } = useDiscoverStore();

  useGamesRealtime();

  useEffect(() => {
    void fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (user) {
      void fetchUserGameRelations(user.id);
    }
  }, [user, fetchUserGameRelations]);

  const games = propGames || dbGames;

  const availableSports = useMemo(
    () => Array.from(new Set(games.map((g) => g.rawSport))).sort(),
    [games],
  );

  const filteredGames = useMemo(
    () =>
      filterDiscoverGames(games, {
        selectedSports,
        hideMyGames,
        savedGamesFilter,
        userId: user?.id,
        userRSVPs,
        userHostedGames,
        savedGameIds,
      }),
    [
      games,
      selectedSports,
      hideMyGames,
      savedGamesFilter,
      user?.id,
      userRSVPs,
      userHostedGames,
      savedGameIds,
    ],
  );

  const center =
    propCenter ||
    (games.length > 0 && games[0].lat && games[0].lng
      ? ([games[0].lat, games[0].lng] as [number, number])
      : ([39.8283, -98.5795] as [number, number]));

  const handleSelectGame = useCallback(
    (game: DiscoverGame) => {
      setSelectedGame(game);
      const params = new URLSearchParams(searchParams);
      params.set("gameId", game.id);
      setSearchParams(params);
    },
    [searchParams, setSearchParams, setSelectedGame],
  );

  const { focusLocation, locateMe } = useLeafletMap({
    games,
    filteredGames,
    center,
    zoom,
    loading,
    onSelectGame: handleSelectGame,
  });

  // Restore game selection from URL
  useEffect(() => {
    const gameId = searchParams.get("gameId");
    if (gameId && games.length > 0 && !selectedGame) {
      const match = games.find((g) => g.id === gameId);
      if (match) {
        setSelectedGame(match);
        focusLocation(match.lat, match.lng, 14);
      }
    }
  }, [searchParams, games, selectedGame, setSelectedGame, focusLocation]);

  // Apply sport filter from URL
  useEffect(() => {
    const sportParam = searchParams.get("sport");
    if (
      sportParam &&
      availableSports.includes(sportParam) &&
      selectedSports.length === 0
    ) {
      setSelectedSports([sportParam]);
      setSearchParams({});
    }
  }, [
    searchParams,
    availableSports,
    selectedSports.length,
    setSelectedSports,
    setSearchParams,
  ]);

  const handleSelectFromList = (game: DiscoverGame) => {
    handleSelectGame(game);
    focusLocation(game.lat, game.lng, 14);
  };

  const handleBackToList = () => {
    setSelectedGame(null);
    const params = new URLSearchParams(searchParams);
    params.delete("gameId");
    setSearchParams(params);
  };

  const legendSports = useMemo(
    () => Array.from(new Set(filteredGames.map((g) => g.sport))),
    [filteredGames],
  );

  return (
    <div className="min-h-screen min-h-screen-mobile bg-gradient-to-br from-blue-50 to-indigo-50">
      <SEO
        title="Discover Pickup Games Near You"
        description="Browse and join pickup games in your area. Find basketball, soccer, volleyball, tennis, cricket and more sports games nearby. Filter by sport, skill level, and location to find the perfect game for you."
        keywords="discover games, find sports near me, local pickup games, basketball near me, soccer games, volleyball games, tennis matches, sports map, game finder, join sports games"
        canonicalUrl="https://squadup.app/discover"
      />
      <Navbar />

      {user && (
        <div className="pt-20 pb-2 px-4">
          <div className="w-full max-w-7xl mx-auto">
            <GameReminderBanner />
          </div>
        </div>
      )}

      <div
        className={`${user ? "pt-2" : "pt-20"} px-2 sm:px-4 pb-4 safe-bottom flex justify-center`}
      >
        <div className="w-full max-w-7xl">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Find Your Game
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Discover pickup games near you
            </p>

            <DiscoverFilterBar
              availableSports={availableSports}
              totalCount={games.length}
              filteredCount={filteredGames.length}
              savedCount={savedGameIds.size}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[calc(100vh-200px)]">
              <div className="lg:col-span-2 relative h-[400px] lg:h-[calc(100vh-200px)]">
                <div
                  id="map"
                  className="w-full h-full rounded-xl shadow-lg border-2 border-gray-200"
                />

                {loading && (
                  <div className="absolute inset-0 bg-white/90 rounded-xl flex items-center justify-center z-[2000]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Loading games...
                      </p>
                    </div>
                  </div>
                )}

                {!loading && games.length === 0 && (
                  <div className="absolute inset-0 bg-white rounded-xl flex items-center justify-center z-[2000]">
                    <div className="text-center p-6">
                      <p className="text-xl font-semibold text-gray-900 mb-2">
                        No games found
                      </p>
                      <p className="text-gray-600 mb-4">
                        Be the first to host a game in your area!
                      </p>
                      <Button
                        onClick={() => navigate("/host-game")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Host a Game
                      </Button>
                    </div>
                  </div>
                )}

                <button
                  onClick={locateMe}
                  className="absolute bottom-4 right-4 z-[1000] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg border-2 border-blue-500 flex items-center justify-center hover:bg-blue-50 transition-all hover:scale-110"
                  title="Locate Me"
                >
                  <Navigation className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </button>

                {!loading && games.length > 0 && (
                  <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 sm:p-3 border border-gray-200 max-h-[200px] sm:max-h-[300px] overflow-y-auto max-w-[150px] sm:max-w-none">
                    <div className="text-xs font-semibold text-gray-700 mb-2">
                      Sports on Map
                    </div>
                    {legendSports.map((sport) => {
                      const match = filteredGames.find(
                        (g) => g.sport === sport,
                      );
                      return (
                        <div
                          key={sport}
                          className="flex items-center gap-1 sm:gap-2 text-xs text-gray-600 mt-1"
                        >
                          <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs sm:text-base">
                            {match?.emoji}
                          </span>
                          <span className="hidden sm:inline">{sport}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-200px)]">
                {DiscoverPanelFactory.create(selectedGame ? "detail" : "list", {
                  selectedGame,
                  filteredGames,
                  isSaved,
                  onToggleSave: toggleSaveGame,
                  onSelectGame: handleSelectFromList,
                  onBack: handleBackToList,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
    </div>
  );
};

export default Discover;
