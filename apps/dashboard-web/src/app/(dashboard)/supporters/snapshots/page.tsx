"use client";

import { useEffect, useState } from "react";
import { Card, Button, Spinner, EmptyState } from "@community/ui";
import { formatDate } from "@/lib/format";

interface SnapshotItem {
  id: string;
  name: string;
  description: string | null;
  initiativeId: string | null;
  recordCount: number;
  createdAt: string;
  initiative: { title: string; slug: string } | null;
}

export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/snapshots`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}` },
    })
      .then((r) => r.json())
      .then((json) => { setSnapshots(json.data?.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createSnapshot = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/snapshots`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
        body: JSON.stringify({ name }),
      });
      window.location.reload();
    } catch {
      setCreating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <a href="/supporters" className="text-sm text-primary-600 hover:underline mb-1 inline-block">Back to supporters</a>
          <h1 className="text-2xl font-bold">Snapshots</h1>
        </div>
      </div>

      <Card className="mb-8">
        <h3 className="font-medium mb-3">Create New Snapshot</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Snapshot name (e.g. 'Q1 2025 Supporters')"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Button onClick={createSnapshot} disabled={creating || !name.trim()}>
            {creating ? "Creating..." : "Create Snapshot"}
          </Button>
        </div>
      </Card>

      {snapshots.length === 0 ? (
        <EmptyState title="No snapshots" description="Create a snapshot to capture a point-in-time record of your supporters." />
      ) : (
        <div className="space-y-3">
          {snapshots.map((snap) => (
            <Card key={snap.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{snap.name}</h3>
                  {snap.description && <p className="text-sm text-gray-500 mt-1">{snap.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{snap.recordCount} records</span>
                    {snap.initiative && <span>{snap.initiative.title}</span>}
                    <span>{formatDate(snap.createdAt)}</span>
                  </div>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002"}/api/dashboard/snapshots/${snap.id}/export`}
                  className="text-sm text-primary-600 hover:underline"
                >
                  Export CSV
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
