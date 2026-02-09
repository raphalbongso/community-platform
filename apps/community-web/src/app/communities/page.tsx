import { apiFetch } from "@/lib/api";
import { Card, EmptyState } from "@community/ui";

interface ForumItem {
  id: string;
  scope: string;
  title: string;
  description: string | null;
  slug: string;
  threadCount: number;
}

export default async function CommunitiesPage() {
  let forums: ForumItem[] = [];
  try {
    const data = await apiFetch<{ items: ForumItem[] }>("/api/public/forums", {
      next: { revalidate: 60 },
    } as RequestInit);
    forums = data.items;
  } catch {
    // API not available
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Communities</h1>
      <p className="text-gray-500 mb-8">Browse forums and join the conversation.</p>

      {forums.length === 0 ? (
        <EmptyState
          title="No forums yet"
          description="Communities will appear here once they're created."
        />
      ) : (
        <div className="space-y-3">
          {forums.map((forum) => (
            <a key={forum.id} href={`/forums/${forum.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{forum.title}</h3>
                    {forum.description && (
                      <p className="text-sm text-gray-500 mt-1">{forum.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-medium text-gray-900">{forum.threadCount}</p>
                    <p className="text-xs text-gray-400">threads</p>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
