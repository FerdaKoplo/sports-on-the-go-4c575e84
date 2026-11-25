import type { ReactNode } from "react";
import type { CommunityViewMode } from "@/stores/communityStore";
import { CommunityItem } from "@/components/partials/community/community-types.props";
import { CommunityListView } from "@/components/partials/community/pages/community-pages-view";
import { CommunityDetailView } from "@/components/partials/community/pages/community-detail-view";

export interface CommunityViewContext {
  highlightedPostId: string | null;
  registerPostRef: (postId: string, el: HTMLDivElement | null) => void;
  onSelectCommunity: (community: CommunityItem) => void;
  onBack: () => void;
}

const VIEW_REGISTRY: Record<
  CommunityViewMode,
  (ctx: CommunityViewContext) => ReactNode
> = {
  list: ({ onSelectCommunity }) => (
    <CommunityListView onSelectCommunity={onSelectCommunity} />
  ),
  posts: ({ highlightedPostId, registerPostRef, onBack }) => (
    <CommunityDetailView
      highlightedPostId={highlightedPostId}
      registerPostRef={registerPostRef}
      onBack={onBack}
    />
  ),
};

export class CommunityViewFactory {
  static create(mode: CommunityViewMode, ctx: CommunityViewContext): ReactNode {
    return VIEW_REGISTRY[mode](ctx);
  }
}
