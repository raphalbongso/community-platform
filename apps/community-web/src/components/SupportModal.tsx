"use client";

import { useState } from "react";
import { Modal, Button, Card } from "@community/ui";

interface Tier {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  perksText: string;
  badgeName: string | null;
}

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
  initiativeTitle: string;
  tiers: Tier[];
}

export function SupportModal({ open, onClose, initiativeTitle, tiers }: SupportModalProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!selectedTier) return;
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/app/support/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selectedTier, quantity: 1 }),
      });

      const data = await res.json();
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Support: ${initiativeTitle}`}>
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Choose a support tier. This is a voluntary contribution and does not constitute a financial obligation.
        </p>
        {tiers.map((tier) => (
          <button
            key={tier.id}
            onClick={() => setSelectedTier(tier.id)}
            className={`w-full text-left rounded-lg border-2 p-4 transition-colors ${
              selectedTier === tier.id
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900">{tier.name}</span>
              <span className="font-bold text-primary-600">
                ${(tier.priceCents / 100).toFixed(2)}
              </span>
            </div>
            {tier.description && (
              <p className="text-sm text-gray-500 mb-2">{tier.description}</p>
            )}
            <p className="text-xs text-gray-400">{tier.perksText}</p>
            {tier.badgeName && (
              <span className="inline-block mt-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                {tier.badgeName} badge
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleCheckout}
          disabled={!selectedTier || loading}
          className="flex-1"
        >
          {loading ? "Redirecting..." : "Continue to Checkout"}
        </Button>
      </div>
    </Modal>
  );
}
