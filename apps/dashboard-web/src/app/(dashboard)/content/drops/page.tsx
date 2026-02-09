"use client";

import { EmptyState } from "@community/ui";

export default function DropsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Drops</h1>
      <EmptyState
        title="No drops yet"
        description="Drops are special releases tied to your initiatives. Create a post with type 'DROP' to get started."
      />
    </div>
  );
}
