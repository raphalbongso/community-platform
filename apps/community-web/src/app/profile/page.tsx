"use client";

import { Card, EmptyState, Avatar, Badge } from "@community/ui";

export default function ProfilePage() {
  // In production this would use auth context
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <Avatar alt="User" fallback="U" size="lg" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Guest User</h2>
            <p className="text-sm text-gray-500">Sign in to view your profile, supports, and badges.</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <a
            href="/login"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Create Account
          </a>
        </div>
      </Card>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Supports</h2>
        <EmptyState
          title="No supports yet"
          description="When you support a creator's initiative, it will appear here."
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Badges</h2>
        <EmptyState
          title="No badges yet"
          description="Earn badges by supporting initiatives."
        />
      </section>
    </main>
  );
}
