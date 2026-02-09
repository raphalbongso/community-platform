"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Badge, Spinner, EmptyState } from "@community/ui";
import { timeAgo } from "@/lib/format";

interface ThreadItem {
  id: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastActivityAt: string;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
}

export default function ForumPage({ params }: { params: Promise<{ id: string }> }) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/public/forums/${id}/threads`)
        .then((r) => r.json())
        .then((json) => { setThreads(json.data?.items ?? []); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Forum</h1>
        <a href="/communities" className="text-sm text-primary-600 hover:underline">Back to communities</a>
      </div>

      {threads.length === 0 ? (
        <EmptyState title="No threads" description="Be the first to start a discussion!" />
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <a key={thread.id} href={`/threads/${thread.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={thread.author.avatarUrl ?? undefined}
                    alt={thread.author.displayName}
                    fallback={thread.author.displayName[0]}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {thread.isPinned && <Badge variant="warning">Pinned</Badge>}
                      {thread.isLocked && <Badge variant="default">Locked</Badge>}
                      <h3 className="font-medium text-gray-900 truncate">{thread.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{thread.author.displayName}</span>
                      <span>{thread.replyCount} replies</span>
                      <span>{thread.viewCount} views</span>
                      <span>{timeAgo(thread.lastActivityAt)}</span>
                    </div>
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
