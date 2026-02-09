"use client";

import { useState } from "react";
import { Card, Button, Input } from "@community/ui";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      setError("Auth not yet configured. Connect Supabase credentials to enable registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display Name"
            value={form.displayName}
            onChange={update("displayName")}
            placeholder="Your name"
            required
          />
          <Input
            label="Username"
            value={form.username}
            onChange={update("username")}
            placeholder="username"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Min 8 characters"
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-primary-600 hover:underline">Sign in</a>
        </p>
      </Card>
    </div>
  );
}
