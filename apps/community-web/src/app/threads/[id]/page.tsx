"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Badge, Spinner, EmptyState, Divider } from "@community/ui";
import { formatDate, timeAgo } from "@/lib/format";

interface CommentItem {
  id: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
}

interface ThreadData {
  id: string;
  forumId: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  author: { id: string; username: string; displayName: string; avatarUrl: string | null };
  comments: CommentItem[];
}

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/public/threads/${id}`)
        .then((r) => r.json())
        .then((json) => { setThread(json.data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!thread) return <EmptyState title="Thread not found" description="This thread doesn't exist." />;

  const topLevelComments = thread.comments.filter((c) => !c.parentId);
  const repliesMap = new Map<string, CommentItem[]>();
  thread.comments.filter((c) => c.parentId).forEach((c) => {
    const existing = repliesMap.get(c.parentId!) ?? [];
    existing.push(c);
    repliesMap.set(c.parentId!, existing);
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <a href={`/forums/${thread.forumId}`} className="text-sm text-primary-600 hover:underline mb-4 inline-block">
        Back to forum
      </a>

      <Card className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          {thread.isPinned && <Badge variant="warning">Pinned</Badge>}
          {thread.isLocked && <Badge variant="default">Locked</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{thread.title}</h1>
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            src={thread.author.avatarUrl ?? undefined}
            alt={thread.author.displayName}
            fallback={thread.author.displayName[0]}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{thread.author.displayName}</p>
            <p className="text-xs text-gray-400">{formatDate(thread.createdAt)} · {thread.viewCount} views</p>
          </div>
        </div>
        <div className="prose prose-sm prose-gray max-w-none whitespace-pre-wrap">
          {thread.body}
        </div>
      </Card>

      <h2 className="text-lg font-semibold mb-4">{thread.replyCount} Replies</h2>
      <Divider className="mb-6" />

      {topLevelComments.length === 0 ? (
        <p className="text-gray-500 text-sm">No replies yet. Be the first to respond!</p>
      ) : (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <div key={comment.id}>
              <div className="flex items-start gap-3">
                <Avatar
                  src={comment.author.avatarUrl ?? undefined}
                  alt={comment.author.displayName}
                  fallback={comment.author.displayName[0]}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{comment.author.displayName}</span>
                    <span className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                </div>
              </div>
              {repliesMap.get(comment.id)?.map((reply) => (
                <div key={reply.id} className="ml-10 mt-4 flex items-start gap-3">
                  <Avatar
                    src={reply.author.avatarUrl ?? undefined}
                    alt={reply.author.displayName}
                    fallback={reply.author.displayName[0]}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{reply.author.displayName}</span>
                      <span className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
