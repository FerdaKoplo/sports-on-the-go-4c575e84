import { useState } from "react";
import {
  MessageSquare,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/stores/authStore";
import { useCommunityStore } from "@/stores/communityStore";
import { getDisplayName, type PostItem } from "../community-types.props";

interface PostCardProps {
  post: PostItem;
  isHighlighted: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
}

export const PostCard = ({
  post,
  isHighlighted,
  registerRef,
}: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    selectedPostId,
    setSelectedPostId,
    comments,
    fetchComments,
    isAdmin,
    dispatchAction,
  } = useCommunityStore();

  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isExpanded = selectedPostId === post.id;

  const handleToggleComments = () => {
    if (isExpanded) {
      setSelectedPostId(null);
      return;
    }
    setSelectedPostId(post.id);
    if (user) {
      void dispatchAction({
        type: "mark_post_viewed",
        postId: post.id,
        userId: user.id,
      });
    }
    if (!comments[post.id]) {
      void fetchComments(post.id);
    }
  };

  const handleVote = async (delta: number) => {
    if (!user) return;
    const res = await dispatchAction({
      type: "vote_post",
      postId: post.id,
      delta,
    });
    if (res.toast) toast(res.toast);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const res = await dispatchAction({ type: "delete_post", postId: post.id });
    if (res.toast) toast(res.toast);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await dispatchAction({
        type: "add_comment",
        postId: post.id,
        userId: user.id,
        content: newComment,
      });
      if (res.toast) toast(res.toast);
      if (res.success) setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await dispatchAction({
      type: "delete_comment",
      commentId,
    });
    if (res.toast) toast(res.toast);
  };

  return (
    <Card
      ref={registerRef}
      className={`transition-all duration-300 ${
        isHighlighted ? "ring-2 ring-primary shadow-lg bg-accent/20" : ""
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{post.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {getDisplayName(post.profiles, post.user_id)} •{" "}
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString()
                : ""}
            </p>
          </div>
          {(post.user_id === user?.id || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeletePost}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-foreground mb-4">{post.content}</p>

        <div className="mobile-stack-full">
          <Button variant="ghost" size="sm" onClick={() => handleVote(1)}>
            <ThumbsUp className="w-4 h-4 mr-1" />
            Like
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleVote(-1)}>
            <ThumbsDown className="w-4 h-4 mr-1" />
            Dislike
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            Score: {post.score}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {post.comment_count}{" "}
            {post.comment_count === 1 ? "comment" : "comments"}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleComments}
            className="relative"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>Comments</span>
            {(post.unreadCount ?? 0) > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2">
                {post.unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-3">
            {comments[post.id]?.map((comment) => (
              <div
                key={comment.id}
                className="bg-muted p-3 rounded relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {getDisplayName(comment.profiles, comment.user_id)}
                    </p>
                    <p className="text-sm text-foreground">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  {(comment.user_id === user?.id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleAddComment();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
