import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/shared/nav/nav";
import { useAuth } from "@/stores/authStore";
import { useCommunityStore } from "@/stores/communityStore";
import { useCommunityRealtime } from "@/hooks/partials/community/use-community-real-time";
import { CommunityItem } from "@/components/partials/community/community-types.props";
import { CommunityViewFactory } from "@/constants/factory/community/community-view-factory";
import { ReviveCommunityDialog } from "@/components/partials/community/pages/revive-community-dialog";

export default function Community() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(
    null,
  );
  const postElements = useRef<Record<string, HTMLDivElement | null>>({});

  const registerPostRef = (postId: string, el: HTMLDivElement | null) => {
    postElements.current[postId] = el;
  };

  const {
    communities,
    selectedCommunity,
    posts,
    viewMode,
    setSelectedPostId,
    fetchCommunities,
    fetchPosts,
    checkMembership,
    fetchCommunityMembers,
    openCommunity,
    closeCommunity,
  } = useCommunityStore();

  useCommunityRealtime();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      void fetchCommunities();
    }
  }, [user, loading, navigate, fetchCommunities]);

  useEffect(() => {
    if (!selectedCommunity || !user) return;
    void Promise.all([
      fetchPosts(selectedCommunity.id, user.id),
      checkMembership(selectedCommunity.id, user.id),
      fetchCommunityMembers(selectedCommunity.id),
    ]);
  }, [
    selectedCommunity,
    user,
    fetchPosts,
    checkMembership,
    fetchCommunityMembers,
  ]);

  useEffect(() => {
    const communityId = searchParams.get("communityId");
    if (communityId && communities.length > 0 && !selectedCommunity) {
      const match = communities.find((c) => c.id === communityId);
      if (match) void openCommunity(match);
    }
  }, [searchParams, communities, selectedCommunity, openCommunity]);

  useEffect(() => {
    const postId = searchParams.get("postId");
    if (!postId || posts.length === 0) return;

    const el = postElements.current[postId];
    if (!el) return;

    let clearTimer: ReturnType<typeof setTimeout>;
    const scrollTimer = setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedPostId(postId);
      setSelectedPostId(postId);

      clearTimer = setTimeout(() => setHighlightedPostId(null), 3000);
    }, 300);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [posts, searchParams, setSelectedPostId]);

  const handleSelectCommunity = (community: CommunityItem) => {
    void openCommunity(community);
    const params = new URLSearchParams(searchParams);
    params.set("communityId", community.id);
    setSearchParams(params);
  };

  const handleBack = () => {
    closeCommunity();
    const params = new URLSearchParams(searchParams);
    params.delete("communityId");
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen min-h-screen-mobile bg-background">
      <SEO
        title="Sports Communities & Discussion Forums"
        description="Join sport-specific communities, connect with fellow athletes, share tips and strategies. Participate in discussions about games, training, and local sports events."
        keywords="sports community, athletic forums, sports discussion, basketball community, soccer forum, connect with athletes, sports groups, game communities"
        canonicalUrl="https://squadup.app/community"
      />
      <Navbar />
      <div className="pt-20 px-4 pb-4 safe-bottom">
        <div className="max-w-7xl mx-auto">
          {CommunityViewFactory.create(viewMode, {
            highlightedPostId,
            registerPostRef,
            onSelectCommunity: handleSelectCommunity,
            onBack: handleBack,
          })}
        </div>
      </div>
      <ReviveCommunityDialog />
    </div>
  );
}
