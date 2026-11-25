import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/authStore";
import { useCommunityStore } from "@/stores/communityStore";
import type { CommunityVisibility } from "@/types";
import { getDisplayName } from "../community-types.props";
import { PostCard } from "../cards/post-card";

interface CommunityDetailViewProps {
  highlightedPostId: string | null;
  registerPostRef: (postId: string, el: HTMLDivElement | null) => void;
  onBack: () => void;
}

export const CommunityDetailView = ({
  highlightedPostId,
  registerPostRef,
  onBack,
}: CommunityDetailViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    selectedCommunity,
    posts,
    isMember,
    isAdmin,
    communityMembers,
    fetchCommunityMembers,
    dispatchAction,
  } = useCommunityStore();

  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [editingVisibility, setEditingVisibility] = useState(false);
  const [visibility, setVisibility] = useState<CommunityVisibility>(
    selectedCommunity?.visibility || "PUBLIC",
  );

  useEffect(() => {
    setVisibility(selectedCommunity?.visibility || "PUBLIC");
    setEditingVisibility(false);
    setShowNewPost(false);
  }, [selectedCommunity]);

  if (!selectedCommunity) return null;

  const handleCreatePost = async () => {
    if (!user || !newPost.title || !newPost.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in title and content.",
        variant: "destructive",
      });
      return;
    }

    const res = await dispatchAction({
      type: "create_post",
      userId: user.id,
      communityId: selectedCommunity.id,
      ...newPost,
    });

    if (res.toast) toast(res.toast);
    if (res.success) {
      setNewPost({ title: "", content: "" });
      setShowNewPost(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${selectedCommunity.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const res = await dispatchAction({
      type: "delete_community",
      communityId: selectedCommunity.id,
    });
    if (res.toast) toast(res.toast);
    if (res.success) onBack();
  };

  const handleKickMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to kick this member?")) return;
    const res = await dispatchAction({ type: "kick_member", memberId });
    if (res.toast) toast(res.toast);
  };

  const handleUpdateVisibility = async () => {
    const res = await dispatchAction({
      type: "update_visibility",
      communityId: selectedCommunity.id,
      visibility,
    });
    if (res.toast) toast(res.toast);
    if (res.success) setEditingVisibility(false);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="mb-4" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-0">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {selectedCommunity.name}
                </CardTitle>
                {selectedCommunity.archived && (
                  <Badge variant="secondary">Archived</Badge>
                )}
              </div>
              <CardDescription className="mt-2">
                {selectedCommunity.description}
              </CardDescription>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {selectedCommunity.member_count} members
                </div>
                {selectedCommunity.sport && (
                  <Badge variant="default">
                    {selectedCommunity.sport.replace(/_/g, " ")}
                  </Badge>
                )}
                {selectedCommunity.visibility && (
                  <Badge
                    variant={
                      selectedCommunity.visibility === "PUBLIC"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {selectedCommunity.visibility.replace(/_/g, " ")}
                  </Badge>
                )}
                {isAdmin && !editingVisibility && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingVisibility(true)}
                    className="text-xs h-7"
                  >
                    Change Privacy
                  </Button>
                )}
              </div>

              {isAdmin && editingVisibility && (
                <div className="flex items-center gap-2 mt-3">
                  <Select
                    value={visibility}
                    onValueChange={(v) =>
                      setVisibility(v as CommunityVisibility)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="FRIENDS_ONLY">Friends Only</SelectItem>
                      <SelectItem value="INVITE_ONLY">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleUpdateVisibility}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingVisibility(false);
                      setVisibility(selectedCommunity.visibility || "PUBLIC");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Sheet
                open={showMembersPanel}
                onOpenChange={(open) => {
                  setShowMembersPanel(open);
                  if (open) void fetchCommunityMembers(selectedCommunity.id);
                }}
              >
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-sm h-9"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Community Members</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    {communityMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted rounded"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {getDisplayName(member.profiles, member.user_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                        {isAdmin && member.user_id !== user?.id && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleKickMember(member.id)}
                          >
                            Kick
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              {isMember ? (
                <>
                  <Button
                    onClick={() => setShowNewPost(!showNewPost)}
                    className="w-full sm:w-auto text-sm h-9"
                  >
                    {showNewPost ? "Cancel" : "New Post"}
                  </Button>
                  {selectedCommunity.created_by === user?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteCommunity}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (!user) return;
                      const res = await dispatchAction({
                        type: "leave_community",
                        communityId: selectedCommunity.id,
                        userId: user.id,
                      });
                      if (res.toast) toast(res.toast);
                    }}
                    className="w-full sm:w-auto text-sm h-9"
                  >
                    Leave
                  </Button>
                </>
              ) : (
                <Button
                  onClick={async () => {
                    if (!user) return;
                    const res = await dispatchAction({
                      type: "join_community",
                      communityId: selectedCommunity.id,
                      userId: user.id,
                    });
                    if (res.toast) toast(res.toast);
                  }}
                  className="w-full sm:w-auto text-sm h-9"
                >
                  Join Community
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {showNewPost && isMember && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={4}
            />
            <Button onClick={handleCreatePost}>Post</Button>
          </CardContent>
        </Card>
      )}

      {!isMember && (
        <Card className="bg-muted border-border">
          <CardContent className="pt-6">
            <p className="text-center text-foreground">
              Join this community to view and create posts
            </p>
          </CardContent>
        </Card>
      )}

      {isMember && posts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No posts yet. Be the first to post!
            </p>
          </CardContent>
        </Card>
      )}

      {isMember &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isHighlighted={highlightedPostId === post.id}
            registerRef={(el) => registerPostRef(post.id, el)}
          />
        ))}
    </div>
  );
};
