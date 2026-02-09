"use client";

import { useEffect, useState } from "react";
import { Badge, Spinner, EmptyState, Avatar } from "@community/ui";
import { Timeline } from "@community/ui";
import { SupportModal } from "@/components/SupportModal";
import { formatDate } from "@/lib/format";

interface Tier {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  perksText: string;
  badgeName: string | null;
  badgeUrl: string | null;
  isActive: boolean;
  position: number;
  maxQuantity: number | null;
}

interface InitiativeData {
  id: string;
  title: string;
  slug: string;
  intentText: string;
  storyText: string | null;
  coverUrl: string | null;
  status: string;
  supporterCount: number;
  postCount: number;
  createdAt: string;
  creator: { id: string; username: string; displayName: string; avatarUrl: string | null };
  milestones: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    completedAt: string | null;
  }>;
  tiers: Tier[];
}

export default function InitiativePage({ params }: { params: Promise<{ slug: string }> }) {
  const [data, setData] = useState<InitiativeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSupport, setShowSupport] = useState(false);
  const [activeTab, setActiveTab] = useState<"story" | "milestones" | "support">("story");

  useEffect(() => {
    params.then(({ slug }) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/public/initiative/${slug}`)
        .then((r) => r.json())
        .then((json) => { setData(json.data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <EmptyState title="Initiative not found" description="This initiative doesn't exist or has been removed." />;

  const milestoneItems = data.milestones.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description ?? undefined,
    date: m.completedAt ? formatDate(m.completedAt) : undefined,
    status: m.status === "COMPLETED" ? "completed" as const : m.status === "IN_PROGRESS" ? "current" as const : "upcoming" as const,
  }));

  const tabs = [
    { id: "story", label: "Story" },
    { id: "milestones", label: `Milestones (${data.milestones.length})` },
    { id: "support", label: "Support Tiers" },
  ];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {data.coverUrl && (
        <div className="h-64 rounded-xl overflow-hidden mb-6 bg-gray-100">
          <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={data.status === "ACTIVE" ? "success" : "default"}>{data.status}</Badge>
            <span className="text-sm text-gray-400">{data.supporterCount} supporters</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-lg text-gray-600 mt-2">{data.intentText}</p>
        </div>
        <button
          onClick={() => setShowSupport(true)}
          className="shrink-0 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Support
        </button>
      </div>

      <a href={`/creator/${data.creator.username}`} className="flex items-center gap-2 mb-8">
        <Avatar
          src={data.creator.avatarUrl ?? undefined}
          alt={data.creator.displayName}
          fallback={data.creator.displayName[0]}
          size="sm"
        />
        <span className="text-sm font-medium text-gray-700 hover:underline">{data.creator.displayName}</span>
      </a>

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

      {activeTab === "story" && (
        <div className="prose prose-gray max-w-none">
          {data.storyText ? (
            <div className="whitespace-pre-wrap">{data.storyText}</div>
          ) : (
            <p className="text-gray-500">No story written yet.</p>
          )}
        </div>
      )}

      {activeTab === "milestones" && (
        milestoneItems.length > 0 ? (
          <Timeline items={milestoneItems} />
        ) : (
          <EmptyState title="No milestones" description="This initiative hasn't added milestones yet." />
        )
      )}

      {activeTab === "support" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.tiers.map((tier) => (
            <div key={tier.id} className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                <span className="text-lg font-bold text-primary-600">${(tier.priceCents / 100).toFixed(2)}</span>
              </div>
              {tier.description && <p className="text-sm text-gray-500 mb-3">{tier.description}</p>}
              <p className="text-xs text-gray-400 mb-3">{tier.perksText}</p>
              {tier.badgeName && (
                <span className="inline-block text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full mb-3">
                  {tier.badgeName} badge
                </span>
              )}
              <button
                onClick={() => { setShowSupport(true); }}
                className="w-full mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}

      <SupportModal
        open={showSupport}
        onClose={() => setShowSupport(false)}
        initiativeTitle={data.title}
        tiers={data.tiers}
      />
    </main>
  );
}
