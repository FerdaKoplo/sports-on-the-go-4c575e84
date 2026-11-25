import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { CommunityVisibility, Game } from "@/types";
import {
  CommunityActionFactory,
  type CommunityActionPayload,
  type CommunityActionResult,
} from "@/constants/factory/community/community-action-factory";
import type {
  AuthorProfile,
  CommentItem,
  CommunityItem,
  CommunityMemberItem,
  PostItem,
} from "@/components/partials/community/community-types.props";

export type CommunityViewMode = "list" | "posts";

const FALLBACK_PROFILE: AuthorProfile = {
  username: null,
  first_name: "Unknown",
  last_name: "User",
};

const fetchProfilesMap = async (userIds: string[]) => {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return new Map();

  const { data } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name")
    .in("id", uniqueIds);

  return new Map(data?.map((p) => [p.id, p]) ?? []);
};

interface CommunityState {
  communities: CommunityItem[];
  selectedCommunity: CommunityItem | null;
  posts: PostItem[];
  comments: Record<string, CommentItem[]>;
  communityMembers: CommunityMemberItem[];
  selectedPostId: string | null;
  viewMode: CommunityViewMode;
  isMember: boolean;
  isAdmin: boolean;
  reviveGameData: Game | null;
  showReviveDialog: boolean;

  setViewMode: (mode: CommunityViewMode) => void;
  setSelectedCommunity: (community: CommunityItem | null) => void;
  setSelectedPostId: (postId: string | null) => void;
  setShowReviveDialog: (open: boolean) => void;

  fetchCommunities: () => Promise<void>;
  fetchPosts: (communityId: string, userId: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
  fetchCommunityMembers: (communityId: string) => Promise<void>;
  checkMembership: (communityId: string, userId: string) => Promise<void>;
  openCommunity: (community: CommunityItem) => Promise<void>;
  closeCommunity: () => void;

  updatePostMetrics: (
    postId: string,
    patch: Partial<Pick<PostItem, "score" | "comment_count" | "unreadCount">>,
  ) => void;
  incrementUnreadCount: (postId: string) => void;

  dispatchAction: <T = unknown>(
    payload: CommunityActionPayload,
  ) => Promise<CommunityActionResult<T>>;
}

type StoreSet = (
  partial:
    | Partial<CommunityState>
    | ((state: CommunityState) => Partial<CommunityState>),
) => void;
type StoreGet = () => CommunityState;

type ActionSyncMap = {
  [K in CommunityActionPayload["type"]]?: (
    payload: Extract<CommunityActionPayload, { type: K }>,
    result: CommunityActionResult<unknown>,
    store: { get: StoreGet; set: StoreSet },
  ) => Promise<void> | void;
};

const ACTION_SYNC_HANDLERS: ActionSyncMap = {
  create_community: async (_payload, _result, { get }) => {
    await get().fetchCommunities();
  },
  delete_community: async (_payload, _result, { get }) => {
    get().closeCommunity();
    await get().fetchCommunities();
  },
  join_community: async (payload, _result, { get }) => {
    await Promise.all([
      get().checkMembership(payload.communityId, payload.userId),
      get().fetchCommunities(),
    ]);
  },
  leave_community: async (payload, _result, { get }) => {
    await Promise.all([
      get().checkMembership(payload.communityId, payload.userId),
      get().fetchCommunities(),
    ]);
  },
  update_visibility: async (payload, _result, { get, set }) => {
    const current = get().selectedCommunity;
    if (current) {
      set({
        selectedCommunity: {
          ...current,
          visibility: payload.visibility as CommunityVisibility,
        },
      });
    }
    await get().fetchCommunities();
  },
  kick_member: async (_payload, _result, { get }) => {
    const current = get().selectedCommunity;
    if (current) {
      await get().fetchCommunityMembers(current.id);
    }
  },
  create_post: async (payload, _result, { get }) => {
    await get().fetchPosts(payload.communityId, payload.userId);
  },
  delete_post: (payload, _result, { set }) => {
    set((state) => ({
      selectedPostId: null,
      posts: state.posts.filter((p) => p.id !== payload.postId),
    }));
  },
  vote_post: (payload, result, { get }) => {
    if (typeof result.data === "number") {
      get().updatePostMetrics(payload.postId, { score: result.data });
    }
  },
  add_comment: async (payload, _result, { get }) => {
    await get().fetchComments(payload.postId);
  },
  delete_comment: async (payload, _result, { get }) => {
    await get().fetchComments(payload.commentId);
  },
  mark_post_viewed: (payload, _result, { get }) => {
    get().updatePostMetrics(payload.postId, { unreadCount: 0 });
  },
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [],
  selectedCommunity: null,
  posts: [],
  comments: {},
  communityMembers: [],
  selectedPostId: null,
  viewMode: "list",
  isMember: false,
  isAdmin: false,
  reviveGameData: null,
  showReviveDialog: false,

  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedCommunity: (selectedCommunity) => set({ selectedCommunity }),
  setSelectedPostId: (selectedPostId) => set({ selectedPostId }),
  setShowReviveDialog: (showReviveDialog) => set({ showReviveDialog }),

  fetchCommunities: async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({ communities: data });
    }
  },

  fetchPosts: async (communityId, userId) => {
    const { data: postsData, error } = await supabase
      .from("posts")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error || !postsData) return;
    if (postsData.length === 0) {
      set({ posts: [] });
      return;
    }

    const profilesMap = await fetchProfilesMap(postsData.map((p) => p.user_id));
    const postIds = postsData.map((p) => p.id);

    const { data: viewData } = await supabase
      .from("post_views")
      .select("post_id, last_viewed_at")
      .eq("user_id", userId)
      .in("post_id", postIds);

    const viewMap = new Map(
      viewData?.map((v) => [v.post_id, v.last_viewed_at]) ?? [],
    );

    const unreadCounts = await Promise.all(
      postsData.map(async (post) => {
        const lastViewed = viewMap.get(post.id);
        let query = supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        if (lastViewed) {
          query = query.gt("created_at", lastViewed);
        }

        const { count } = await query;
        return [post.id, count || 0] as const;
      }),
    );

    const unreadMap = new Map(unreadCounts);

    const enrichedPosts: PostItem[] = postsData.map((post) => ({
      ...post,
      profiles: profilesMap.get(post.user_id) || FALLBACK_PROFILE,
      unreadCount: unreadMap.get(post.id) || 0,
    }));

    set({ posts: enrichedPosts });
  },

  fetchComments: async (postId) => {
    const { data: commentsData, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error || !commentsData) return;

    const profilesMap = await fetchProfilesMap(
      commentsData.map((c) => c.user_id),
    );

    const enriched: CommentItem[] = commentsData.map((comment) => ({
      ...comment,
      profiles: profilesMap.get(comment.user_id) || FALLBACK_PROFILE,
    }));

    set((state) => ({
      comments: { ...state.comments, [postId]: enriched },
    }));
  },

  fetchCommunityMembers: async (communityId) => {
    const { data: membersData, error } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", communityId)
      .order("joined_at", { ascending: false });

    if (error || !membersData) return;

    const profilesMap = await fetchProfilesMap(
      membersData.map((m) => m.user_id),
    );

    const enriched: CommunityMemberItem[] = membersData.map((member) => ({
      ...member,
      profiles: profilesMap.get(member.user_id) || FALLBACK_PROFILE,
    }));

    set({ communityMembers: enriched });
  },

  checkMembership: async (communityId, userId) => {
    const { data } = await supabase
      .from("community_members")
      .select("id, role")
      .eq("community_id", communityId)
      .eq("user_id", userId)
      .maybeSingle();

    set({
      isMember: Boolean(data),
      isAdmin: data?.role === "admin",
    });
  },

  openCommunity: async (community) => {
    set({ selectedCommunity: community, viewMode: "posts" });

    if (community.archived && community.game_id) {
      const { data: game } = await supabase
        .from("games")
        .select("*")
        .eq("id", community.game_id)
        .maybeSingle();

      if (game) {
        set({ reviveGameData: game, showReviveDialog: true });
      }
    }
  },

  closeCommunity: () =>
    set({
      selectedCommunity: null,
      viewMode: "list",
      selectedPostId: null,
      posts: [],
    }),

  updatePostMetrics: (postId, patch) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
    })),

  incrementUnreadCount: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, unreadCount: (p.unreadCount || 0) + 1 } : p,
      ),
    })),

  dispatchAction: async <T = unknown>(payload: CommunityActionPayload) => {
    const strategy = CommunityActionFactory.create(payload);
    const result = (await strategy.execute()) as CommunityActionResult<T>;

    if (!result.success) return result;

    const syncHandler = ACTION_SYNC_HANDLERS[payload.type] as
      | ((
          p: CommunityActionPayload,
          r: CommunityActionResult<T>,
          store: { get: StoreGet; set: StoreSet },
        ) => Promise<void> | void)
      | undefined;

    if (syncHandler) {
      await syncHandler(payload, result, { get, set });
    }

    return result;
  },
}));
