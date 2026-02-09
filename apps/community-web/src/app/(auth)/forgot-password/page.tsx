"use client";

import { useState } from "react";
import { Card, Button, Input } from "@community/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Supabase password reset will go here
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-sm text-gray-500 mt-1">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
              <p className="text-sm text-green-700">
                If an account exists for {email}, you'll receive a password reset link.
              </p>
            </div>
            <a href="/login" className="text-sm text-primary-600 hover:underline">Back to sign in</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              <a href="/login" className="text-primary-600 hover:underline">Back to sign in</a>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}
