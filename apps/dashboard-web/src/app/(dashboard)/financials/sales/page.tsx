"use client";

import { useEffect, useState } from "react";
import { Card, Spinner, EmptyState } from "@community/ui";
import { StatCard } from "@/components/StatCard";
import { formatCents, formatDateTime } from "@/lib/format";

interface SaleItem {
  id: string;
  buyer: { username: string; displayName: string; email: string };
  tier: { name: string };
  initiative: { title: string };
  quantity: number;
  amountCents: number;
  feeCents: number;
  netCents: number;
  provider: string;
  providerRef: string | null;
  status: string;
  createdAt: string;
}

interface SalesData {
  items: SaleItem[];
  totals: { totalAmountCents: number; totalFeeCents: number; totalNetCents: number; count: number };
  hasMore: boolean;
}

export default function SalesLedgerPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/sales-ledger?limit=100`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setData(json.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const totals = data?.totals ?? { totalAmountCents: 0, totalFeeCents: 0, totalNetCents: 0, count: 0 };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sales Ledger</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Gross Revenue" value={formatCents(totals.totalAmountCents)} />
        <StatCard label="Fees" value={formatCents(totals.totalFeeCents)} />
        <StatCard label="Net Earnings" value={formatCents(totals.totalNetCents)} />
        <StatCard label="Transactions" value={totals.count.toString()} />
      </div>

      {!data?.items?.length ? (
        <EmptyState title="No sales yet" description="Your sales will appear here once supporters make purchases." />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Buyer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Initiative</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tier</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Fee</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Net</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.items.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDateTime(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900">{sale.buyer.displayName}</p>
                      <p className="text-xs text-gray-400">{sale.buyer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sale.initiative.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sale.tier.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{sale.quantity}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCents(sale.amountCents)}</td>
                    <td className="px-4 py-3 text-sm text-red-500 text-right">-{formatCents(sale.feeCents)}</td>
                    <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">{formatCents(sale.netCents)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{sale.provider}</td>
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
