import { apiFetch } from "@/lib/api";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@community/ui";

interface FeedPost {
  id: string;
  title: string;
  bodyPreview: string;
  type: string;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  creator: { username: string; displayName: string; avatarUrl: string | null };
}

export default async function FeedPage() {
  let posts: FeedPost[] = [];
  try {
    const data = await apiFetch<{ items: FeedPost[] }>("/api/public/feed", {
      next: { revalidate: 30 },
    } as RequestInit);
    posts = data.items;
  } catch {
    // API not available yet - show empty state
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Posts from creators you follow will appear here."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
