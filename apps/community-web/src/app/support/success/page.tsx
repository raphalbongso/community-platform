import { Card } from "@community/ui";

export default function SupportSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <div className="text-5xl mb-4">&#10003;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Confirmed!</h1>
        <p className="text-gray-500 mb-6">
          Thank you for your support. Your entitlements have been activated.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/profile"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            View My Supports
          </a>
          <a
            href="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Feed
          </a>
        </div>
      </Card>
    </div>
  );
}
