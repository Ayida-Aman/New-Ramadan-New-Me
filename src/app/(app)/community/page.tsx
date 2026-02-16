/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useUser } from "@/providers/supabase-provider";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  MessageCircle,
  Send,
  Loader2,
  TrendingUp,
  Sparkles,
  HandHeart,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import type { CommunityPost, PostType } from "@/types/supabase";

const POST_TYPES: { value: PostType; label: string; icon: typeof Star }[] = [
  { value: "progress", label: "Progress", icon: TrendingUp },
  { value: "encouragement", label: "Encouragement", icon: Sparkles },
  { value: "kindness", label: "Kindness Story", icon: HandHeart },
];

interface PostWithProfile extends CommunityPost {
  profiles: { display_name: string; avatar_url: string | null } | null;
}

export default function CommunityPage() {
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<PostType>("encouragement");
  const [showCompose, setShowCompose] = useState(false);

  // Fetch posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("community_posts")
        .select("*, profiles(display_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data ?? []) as unknown as PostWithProfile[];
    },
  });

  // Fetch user's likes
  const { data: userLikes } = useQuery({
    queryKey: ["user-likes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id);
      return (data ?? []).map((l: any) => l.post_id);
    },
    enabled: !!user,
  });

  const likedPostIds = new Set(userLikes ?? []);

  // Create post
  const createPost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not auth");
      const { error } = await supabase.from("community_posts").insert({
        user_id: user.id,
        post_type: newType,
        content: newContent,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      setNewContent("");
      setShowCompose(false);
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  // Toggle like
  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Not auth");
      const isLiked = likedPostIds.has(postId);
      if (isLiked) {
        await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("post_likes").insert({
          post_id: postId,
          user_id: user.id,
        } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-likes", user?.id] });
    },
  });

  // Featured posts
  const featuredPosts = posts?.filter((p) => p.is_featured).slice(0, 3) ?? [];
  const regularPosts = posts?.filter((p) => !p.is_featured) ?? [];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy dark:text-cream-light">
            Community
          </h1>
          <p className="text-muted mt-1">Share and uplift together</p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-navy dark:bg-gold text-cream-light dark:text-navy px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Share
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="bg-card rounded-2xl border border-border/50 p-5 animate-fade-in-up">
          <div className="flex flex-wrap gap-2 mb-3">
            {POST_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setNewType(type.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all",
                  newType === type.value
                    ? "bg-gold/10 text-gold"
                    : "bg-secondary text-muted"
                )}
              >
                <type.icon className="h-3.5 w-3.5" />
                {type.label}
              </button>
            ))}
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Share your progress, encouragement, or a kindness story..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted">
              {newContent.length}/1000
            </span>
            <button
              onClick={() => createPost.mutate()}
              disabled={createPost.isPending || !newContent.trim()}
              className="bg-navy dark:bg-gold text-cream-light dark:text-navy px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {createPost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Post
            </button>
          </div>
        </div>
      )}

      {/* Featured section */}
      {featuredPosts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-gold" />
            Featured This Week
          </h2>
          <div className="space-y-3">
            {featuredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPostIds.has(post.id)}
                onLike={() => toggleLike.mutate(post.id)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All posts */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 text-gold animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {regularPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPostIds.has(post.id)}
              onLike={() => toggleLike.mutate(post.id)}
            />
          ))}
          {regularPosts.length === 0 && !showCompose && (
            <div className="text-center py-10">
              <MessageCircle className="h-10 w-10 text-gold/30 mx-auto mb-3" />
              <p className="text-muted">
                Be the first to share something uplifting!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  isLiked,
  onLike,
  featured,
}: {
  post: PostWithProfile;
  isLiked: boolean;
  onLike: () => void;
  featured?: boolean;
}) {
  const typeInfo = POST_TYPES.find((t) => t.value === post.post_type);
  const displayName = post.profiles?.display_name ?? "Anonymous";

  return (
    <div
      className={cn(
        "bg-card rounded-xl border p-4",
        featured ? "border-gold/30 shadow-sm shadow-gold/5" : "border-border/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-sm font-semibold text-gold shrink-0">
          {getInitials(displayName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy dark:text-cream-light">
              {displayName}
            </span>
            {typeInfo && (
              <span className="text-[10px] font-medium bg-secondary text-muted px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <typeInfo.icon className="h-2.5 w-2.5" />
                {typeInfo.label}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
            {post.content}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={onLike}
              className={cn(
                "flex items-center gap-1 text-sm transition-colors",
                isLiked ? "text-pink-500" : "text-muted hover:text-pink-500"
              )}
            >
              <Heart
                className={cn("h-4 w-4", isLiked && "fill-current")}
              />
              {post.likes_count > 0 && post.likes_count}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
