"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Badge, Spinner } from "@community/ui";
import { StatCard } from "@/components/StatCard";
import { formatCents, timeAgo } from "@/lib/format";

interface OverviewData {
  stats: {
    totalEarnedCents: number;
    totalSupporters: number;
    activeInitiatives: number;
    totalInitiatives: number;
  };
  initiatives: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    purchaseCount: number;
    supporterCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    buyer: { username: string; displayName: string; avatarUrl: string | null };
    tierName: string;
    initiativeTitle: string;
    amountCents: number;
    netCents: number;
    createdAt: string;
  }>;
}

export default function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/overview`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setData(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const stats = data?.stats ?? { totalEarnedCents: 0, totalSupporters: 0, activeInitiatives: 0, totalInitiatives: 0 };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Earned" value={formatCents(stats.totalEarnedCents)} />
        <StatCard label="Supporters" value={stats.totalSupporters.toString()} />
        <StatCard label="Active Initiatives" value={stats.activeInitiatives.toString()} />
        <StatCard label="Total Initiatives" value={stats.totalInitiatives.toString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-semibold mb-4">Initiatives</h2>
          {data?.initiatives && data.initiatives.length > 0 ? (
            <div className="space-y-2">
              {data.initiatives.map((i) => (
                <a key={i.id} href={`/initiatives/${i.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{i.title}</h3>
                        <p className="text-xs text-gray-400">{i.supporterCount} supporters · {i.purchaseCount} purchases</p>
                      </div>
                      <Badge variant={i.status === "ACTIVE" ? "success" : "default"}>{i.status}</Badge>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <Card><p className="text-sm text-gray-500">No initiatives yet.</p></Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {data?.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((a) => (
                <Card key={a.id}>
                  <div className="flex items-center gap-3">
                    <Avatar
                      alt={a.buyer.displayName}
                      fallback={a.buyer.displayName[0]}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{a.buyer.displayName}</span>
                        {" supported "}
                        <span className="font-medium">{a.initiativeTitle}</span>
                      </p>
                      <p className="text-xs text-gray-400">{a.tierName} · {timeAgo(a.createdAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-green-600">{formatCents(a.netCents)}</p>
                      <p className="text-xs text-gray-400">net</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card><p className="text-sm text-gray-500">No recent activity.</p></Card>
          )}
        </section>
      </div>
    </div>
  );
}
