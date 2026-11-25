import { DiscoverGame } from "@/components/partials/discover/discover-types.props";
import { GameDetailPanel } from "@/components/partials/discover/pages/game-detail";
import { NearbyGamesList } from "@/components/partials/discover/pages/nearby-games";
import type { ReactNode } from "react";

export type DiscoverPanelMode = "detail" | "list";

export interface DiscoverPanelContext {
  selectedGame: DiscoverGame | null;
  filteredGames: DiscoverGame[];
  isSaved: (gameId: string) => boolean;
  onToggleSave: (gameId: string) => void;
  onSelectGame: (game: DiscoverGame) => void;
  onBack: () => void;
}

const PANEL_REGISTRY: Record<
  DiscoverPanelMode,
  (ctx: DiscoverPanelContext) => ReactNode
> = {
  detail: ({ selectedGame, isSaved, onToggleSave, onBack }) =>
    selectedGame ? (
      <GameDetailPanel
        game={selectedGame}
        isSaved={isSaved(selectedGame.id)}
        onToggleSave={onToggleSave}
        onBack={onBack}
      />
    ) : null,
  list: ({ filteredGames, isSaved, onSelectGame }) => (
    <NearbyGamesList
      games={filteredGames}
      isSaved={isSaved}
      onSelectGame={onSelectGame}
    />
  ),
};

export class DiscoverPanelFactory {
  static create(mode: DiscoverPanelMode, ctx: DiscoverPanelContext): ReactNode {
    return PANEL_REGISTRY[mode](ctx);
  }
}
