"use client";

import { useEffect, useState } from "react";
import { Card, Avatar, Spinner, EmptyState } from "@community/ui";
import { formatCents, formatDate } from "@/lib/format";

interface SupporterItem {
  id: string;
  user: { id: string; username: string; displayName: string; email: string; avatarUrl: string | null; createdAt: string };
  tier: { id: string; name: string; priceCents: number };
  initiative: { id: string; title: string; slug: string };
  quantityActive: number;
  source: string;
  grantedAt: string;
  financials: { totalSpentCents: number; totalNetCents: number; purchaseCount: number };
}

export default function SupportersPage() {
  const [supporters, setSupporters] = useState<SupporterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSupporters = (query?: string) => {
    const params = new URLSearchParams({ limit: "100" });
    if (query) params.set("search", query);

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/supporters?${params}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setSupporters(json.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSupporters(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchSupporters(search);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Supporter Registry</h1>
        <a href="/supporters/snapshots" className="text-sm text-primary-600 hover:underline">Snapshots</a>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </form>

      {supporters.length === 0 ? (
        <EmptyState title="No supporters" description="Your supporter list will populate as people support your initiatives." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Supporter</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Initiative</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tier</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Total Spent</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Net to You</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Purchases</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {supporters.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar alt={s.user.displayName} fallback={s.user.displayName[0]} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.user.displayName}</p>
                          <p className="text-xs text-gray-400">{s.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.initiative.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.tier.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{s.quantityActive}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCents(s.financials.totalSpentCents)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">{formatCents(s.financials.totalNetCents)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{s.financials.purchaseCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{formatDate(s.grantedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
