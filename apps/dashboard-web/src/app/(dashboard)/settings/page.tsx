"use client";

import { Card, Button, Input } from "@community/ui";
import { Divider } from "@community/ui";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Card className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <Input label="Display Name" placeholder="Your display name" />
          <Input label="Username" placeholder="username" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Tell your supporters about yourself..."
            />
          </div>
          <Button>Save Profile</Button>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Email me when someone supports my initiative</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Email me for new comments and replies</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-sm text-gray-700">Weekly summary email</span>
          </label>
          <Button variant="secondary">Save Notifications</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Integrations</h2>
        <Divider className="mb-4" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Stripe</p>
              <p className="text-xs text-gray-400">Process payments from supporters</p>
            </div>
            <Button variant="secondary" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Discord</p>
              <p className="text-xs text-gray-400">Sync roles with supporter tiers</p>
            </div>
            <Button variant="secondary" size="sm">Connect</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
