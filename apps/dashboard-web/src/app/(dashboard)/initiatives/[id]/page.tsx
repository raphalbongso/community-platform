"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner, EmptyState } from "@community/ui";
import { Timeline } from "@community/ui";
import { StatCard } from "@/components/StatCard";
import { formatCents, formatDate } from "@/lib/format";

interface InitiativeDetail {
  id: string;
  title: string;
  slug: string;
  intentText: string;
  storyText: string | null;
  status: string;
  createdAt: string;
  milestones: Array<{ id: string; title: string; description: string | null; status: string; position: number; completedAt: string | null }>;
  supportTiers: Array<{ id: string; name: string; priceCents: number; soldCount: number; isActive: boolean; maxQuantity: number | null }>;
  financials: { totalAmountCents: number; totalFeeCents: number; totalNetCents: number; purchaseCount: number };
  supporterCount: number;
  postCount: number;
}

export default function InitiativeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [data, setData] = useState<InitiativeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "milestones" | "tiers">("overview");

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/initiatives/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
      })
        .then((r) => r.json())
        .then((json) => { setData(json.data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!data) return <EmptyState title="Not found" description="Initiative not found." />;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "milestones", label: `Milestones (${data.milestones.length})` },
    { id: "tiers", label: `Tiers (${data.supportTiers.length})` },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/initiatives" className="text-sm text-primary-600 hover:underline mb-1 inline-block">Back to initiatives</a>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <Badge variant={data.status === "ACTIVE" ? "success" : "default"}>{data.status}</Badge>
          </div>
          <p className="text-gray-500 mt-1">{data.intentText}</p>
        </div>
        <Button variant="secondary">Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={formatCents(data.financials.totalAmountCents)} />
        <StatCard label="Net Earnings" value={formatCents(data.financials.totalNetCents)} />
        <StatCard label="Fees" value={formatCents(data.financials.totalFeeCents)} />
        <StatCard label="Purchases" value={data.financials.purchaseCount.toString()} />
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Supporters</p>
            <p className="text-xl font-bold mt-1">{data.supporterCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Posts</p>
            <p className="text-xl font-bold mt-1">{data.postCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-sm font-medium mt-1">{formatDate(data.createdAt)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Slug</p>
            <p className="text-sm font-mono mt-1">{data.slug}</p>
          </Card>
        </div>
      )}

      {tab === "milestones" && (
        data.milestones.length > 0 ? (
          <Timeline
            items={data.milestones.map((m) => ({
              id: m.id,
              title: m.title,
              description: m.description ?? undefined,
              date: m.completedAt ? formatDate(m.completedAt) : undefined,
              status: m.status === "COMPLETED" ? "completed" as const : m.status === "IN_PROGRESS" ? "current" as const : "upcoming" as const,
            }))}
          />
        ) : (
          <EmptyState title="No milestones" description="Add milestones to track progress." />
        )
      )}

      {tab === "tiers" && (
        <div className="space-y-3">
          {data.supportTiers.map((tier) => (
            <Card key={tier.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{tier.name}</h3>
                    <Badge variant={tier.isActive ? "success" : "default"}>{tier.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCents(tier.priceCents)} · {tier.soldCount} sold
                    {tier.maxQuantity !== null && ` / ${tier.maxQuantity} max`}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600">{formatCents(tier.priceCents * tier.soldCount)}</p>
              </div>
            </Card>
          ))}
          {data.supportTiers.length === 0 && (
            <EmptyState title="No tiers" description="Create support tiers for this initiative." />
          )}
        </div>
      )}
    </div>
  );
}
