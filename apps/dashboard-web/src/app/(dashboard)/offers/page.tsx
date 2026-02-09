"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner, EmptyState } from "@community/ui";
import { formatCents, formatDate } from "@/lib/format";

interface OfferItem {
  id: string;
  initiative: { id: string; title: string; slug: string };
  tier: { id: string; name: string; priceCents: number };
  maxQuantity: number;
  priceCents: number;
  startsAt: string;
  endsAt: string;
  status: string;
  acceptedQty: number;
  acceptanceCount: number;
}

const statusColors: Record<string, string> = {
  DRAFT: "default",
  ACTIVE: "success",
  COMPLETED: "default",
  EXPIRED: "warning",
  CANCELLED: "error",
};

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/offers`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setOffers(json.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Acquisition Offers</h1>
        <Button>New Offer</Button>
      </div>

      {offers.length === 0 ? (
        <EmptyState title="No offers" description="Create acquisition offers to distribute support tiers." />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{offer.initiative.title} - {offer.tier.name}</h3>
                    <Badge variant={statusColors[offer.status] as "default" | "success" | "warning" | "error" ?? "default"}>
                      {offer.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatCents(offer.priceCents)} per unit</span>
                    <span>{offer.acceptedQty} / {offer.maxQuantity} accepted</span>
                    <span>{offer.acceptanceCount} acceptances</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(offer.startsAt)} - {formatDate(offer.endsAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {formatCents(offer.priceCents * offer.acceptedQty)}
                  </p>
                  <p className="text-xs text-gray-400">total value</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
