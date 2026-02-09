"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner, EmptyState } from "@community/ui";
import { timeAgo } from "@/lib/format";

interface PostItem {
  id: string;
  title: string;
  type: string;
  visibility: string;
  likeCount: number;
  commentCount: number;
  publishedAt: string | null;
  createdAt: string;
  initiative: { id: string; title: string; slug: string } | null;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/posts`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setPosts(json.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button>New Post</Button>
      </div>

      {posts.length === 0 ? (
        <EmptyState title="No posts" description="Create your first post to engage with your community." />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <Badge variant={post.type === "ANNOUNCEMENT" ? "warning" : post.type === "DROP" ? "success" : "default"}>
                      {post.type}
                    </Badge>
                    <Badge variant={post.visibility === "PUBLIC" ? "default" : "warning"}>
                      {post.visibility}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {post.initiative && <span>{post.initiative.title}</span>}
                    <span>{post.likeCount} likes</span>
                    <span>{post.commentCount} comments</span>
                    <span>{post.publishedAt ? timeAgo(post.publishedAt) : "Draft"}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
