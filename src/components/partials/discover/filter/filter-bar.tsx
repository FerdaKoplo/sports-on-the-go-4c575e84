import { Bookmark } from "lucide-react";
import { useAuth } from "@/stores/authStore";
import { useDiscoverStore } from "@/stores/discoverStore";
import { getSportEmoji, toDisplaySportName } from "@/utils/sportsUtils";
import { type SavedGamesFilterMode } from "../discover-types.props";

const SAVED_FILTER_OPTIONS: Array<{
  mode: SavedGamesFilterMode;
  label: string;
  withIcon?: boolean;
}> = [
  { mode: "all", label: "Show All" },
  { mode: "only-saved", label: "Only Saved", withIcon: true },
  { mode: "hide-saved", label: "Hide Saved" },
];

interface DiscoverFilterBarProps {
  availableSports: string[];
  totalCount: number;
  filteredCount: number;
  savedCount: number;
}

export const DiscoverFilterBar = ({
  availableSports,
  totalCount,
  filteredCount,
  savedCount,
}: DiscoverFilterBarProps) => {
  const { user } = useAuth();
  const {
    selectedSports,
    toggleSportFilter,
    hideMyGames,
    setHideMyGames,
    savedGamesFilter,
    setSavedGamesFilter,
  } = useDiscoverStore();

  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">
        Filter by Sport:
      </h3>

      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {availableSports.map((sport) => {
            const isSelected = selectedSports.includes(sport);
            return (
              <button
                key={sport}
                onClick={() => toggleSportFilter(sport)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="text-sm sm:text-base">
                  {getSportEmoji(sport)}
                </span>
                <span>{toDisplaySportName(sport)}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hideMyGames"
              checked={hideMyGames}
              onChange={(e) => setHideMyGames(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label
              htmlFor="hideMyGames"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Hide My Games (hosting or RSVPed)
            </label>
          </div>

          {user && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <label className="text-sm font-medium text-gray-700">
                Saved Games:
              </label>
              <div className="flex gap-2">
                {SAVED_FILTER_OPTIONS.map(({ mode, label, withIcon }) => {
                  const active = savedGamesFilter === mode;
                  const activeStyle =
                    mode === "only-saved"
                      ? "bg-amber-500 text-white"
                      : "bg-primary text-primary-foreground";

                  return (
                    <button
                      key={mode}
                      onClick={() => setSavedGamesFilter(mode)}
                      className={`px-3 py-1 text-xs rounded-full transition-all flex items-center gap-1 ${
                        active
                          ? activeStyle
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {withIcon && <Bookmark className="w-3 h-3" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-3">
          Showing {filteredCount} of {totalCount} games
          {user && savedGamesFilter === "only-saved" && savedCount > 0 && (
            <span className="ml-1 text-amber-600"> - {savedCount} saved</span>
          )}
        </p>
      </div>
    </div>
  );
};
