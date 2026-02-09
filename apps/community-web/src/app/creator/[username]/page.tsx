"use client";

import { useEffect, useState } from "react";
import { Avatar, Badge, Spinner, EmptyState } from "@community/ui";
import { PostCard } from "@/components/PostCard";
import { InitiativeCard } from "@/components/InitiativeCard";

interface CreatorData {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  creatorProfile: {
    bio: string | null;
    genreTags: string[];
    socials: Record<string, string> | null;
    verified: boolean;
    followerCount: number;
  };
  initiatives: Array<{
    id: string;
    title: string;
    slug: string;
    intentText: string;
    coverUrl: string | null;
    status: string;
    supporterCount: number;
  }>;
  recentPosts: Array<{
    id: string;
    type: string;
    title: string;
    bodyPreview: string;
    likeCount: number;
    commentCount: number;
    publishedAt: string | null;
  }>;
}

export default function CreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const [data, setData] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"updates" | "initiatives" | "about">("updates");

  useEffect(() => {
    params.then(({ username }) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/public/creator/${username}`)
        .then((r) => r.json())
        .then((json) => { setData(json.data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <EmptyState title="Creator not found" description="This creator doesn't exist." />;

  const tabs = [
    { id: "updates", label: `Updates (${data.recentPosts.length})` },
    { id: "initiatives", label: `Initiatives (${data.initiatives.length})` },
    { id: "about", label: "About" },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-5 mb-8">
        <Avatar
          src={data.avatarUrl ?? undefined}
          alt={data.displayName}
          fallback={data.displayName[0]}
          size="lg"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{data.displayName}</h1>
            {data.creatorProfile.verified && <Badge variant="success">Verified</Badge>}
          </div>
          <p className="text-gray-500">@{data.username}</p>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
            <span>{data.creatorProfile.followerCount} followers</span>
            <span>{data.initiatives.length} initiatives</span>
          </div>
          {data.creatorProfile.genreTags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {data.creatorProfile.genreTags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "updates" && (
        data.recentPosts.length > 0 ? (
          <div className="space-y-4">
            {data.recentPosts.map((post) => (
              <PostCard
                key={post.id}
                post={{ ...post, creator: { username: data.username, displayName: data.displayName, avatarUrl: data.avatarUrl } }}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No updates" description="This creator hasn't posted any updates yet." />
        )
      )}

      {activeTab === "initiatives" && (
        data.initiatives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.initiatives.map((initiative) => (
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
          </div>
        ) : (
          <EmptyState title="No initiatives" description="This creator hasn't launched any initiatives yet." />
        )
      )}

      {activeTab === "about" && (
        <div>
          {data.creatorProfile.bio ? (
            <p className="text-gray-700 whitespace-pre-wrap">{data.creatorProfile.bio}</p>
          ) : (
            <p className="text-gray-500">No bio yet.</p>
          )}
          {data.creatorProfile.socials && Object.keys(data.creatorProfile.socials).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Links</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.creatorProfile.socials).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline capitalize"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
