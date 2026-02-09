"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner, EmptyState } from "@community/ui";
import { formatCents } from "@/lib/format";

interface InitiativeItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  purchaseCount: number;
  supporterCount: number;
  milestoneCount: number;
  postCount: number;
  tiers: Array<{ id: string; name: string; priceCents: number; soldCount: number; isActive: boolean }>;
}

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<InitiativeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/initiatives`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setInitiatives(json.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Initiatives</h1>
        <Button onClick={() => window.location.href = "/initiatives/new"}>New Initiative</Button>
      </div>

      {initiatives.length === 0 ? (
        <EmptyState title="No initiatives" description="Create your first initiative to get started." />
      ) : (
        <div className="space-y-4">
          {initiatives.map((i) => (
            <a key={i.id} href={`/initiatives/${i.id}`} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{i.title}</h3>
                      <Badge variant={i.status === "ACTIVE" ? "success" : i.status === "DRAFT" ? "default" : "warning"}>
                        {i.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{i.supporterCount} supporters</span>
                      <span>{i.purchaseCount} purchases</span>
                      <span>{i.milestoneCount} milestones</span>
                      <span>{i.postCount} posts</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {i.tiers.length > 0 && (
                      <div className="text-xs text-gray-400">
                        {i.tiers.length} tiers · {i.tiers.reduce((sum, t) => sum + t.soldCount, 0)} sold
                      </div>
                    )}
                  </div>
                </div>
                {i.tiers.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {i.tiers.map((t) => (
                      <span key={t.id} className={`text-xs px-2 py-1 rounded-full ${t.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {t.name}: {formatCents(t.priceCents)} ({t.soldCount} sold)
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
