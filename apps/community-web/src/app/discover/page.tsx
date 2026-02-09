import { apiFetch } from "@/lib/api";
import { InitiativeCard } from "@/components/InitiativeCard";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@community/ui";

interface SearchResults {
  query: string;
  results: {
    initiatives?: Array<{
      id: string;
      title: string;
      slug: string;
      intentText: string;
      coverUrl: string | null;
      status: string;
      supporterCount: number;
      creator: { username: string; displayName: string; avatarUrl: string | null };
    }>;
    creators?: Array<{
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
      creatorProfile: { bio: string | null; verified: boolean; followerCount: number } | null;
    }>;
    posts?: Array<{
      id: string;
      title: string;
      bodyPreview: string;
      type: string;
      likeCount: number;
      commentCount: number;
      publishedAt: string | null;
      creator: { username: string; displayName: string; avatarUrl: string | null };
    }>;
  };
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let results: SearchResults["results"] = {};
  if (q && q.length >= 2) {
    try {
      const data = await apiFetch<SearchResults>(
        `/api/public/search?q=${encodeURIComponent(q)}&type=all`,
        { next: { revalidate: 30 } } as RequestInit
      );
      results = data.results;
    } catch {
      // API not available
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Discover</h1>
      <p className="text-gray-500 mb-6">Find creators, initiatives, and content.</p>

      <form action="/discover" method="GET" className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search creators, initiatives, posts..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Search
          </button>
        </div>
      </form>

      {q && (
        <div className="space-y-10">
          {results.creators && results.creators.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Creators</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.creators.map((creator) => (
                  <a
                    key={creator.id}
                    href={`/creator/${creator.username}`}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                      {creator.displayName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{creator.displayName}</p>
                      <p className="text-sm text-gray-500">@{creator.username}</p>
                      {creator.creatorProfile && (
                        <p className="text-xs text-gray-400">
                          {creator.creatorProfile.followerCount} followers
                          {creator.creatorProfile.verified && " \u00b7 Verified"}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {results.initiatives && results.initiatives.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Initiatives</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.initiatives.map((initiative) => (
                  <InitiativeCard key={initiative.id} initiative={initiative} />
                ))}
              </div>
            </section>
          )}

          {results.posts && results.posts.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Posts</h2>
              <div className="space-y-4 max-w-3xl">
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {!results.creators?.length && !results.initiatives?.length && !results.posts?.length && (
            <EmptyState
              title="No results found"
              description={`No results for "${q}". Try different keywords.`}
            />
          )}
        </div>
      )}

      {!q && (
        <EmptyState
          title="Start searching"
          description="Type a query above to discover creators, initiatives, and content."
        />
      )}
    </main>
  );
}
