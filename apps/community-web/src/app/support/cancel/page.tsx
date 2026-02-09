import { Card } from "@community/ui";

export default function SupportCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Cancelled</h1>
        <p className="text-gray-500 mb-6">
          Your checkout was cancelled. No charges were made.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Back to Feed
        </a>
      </Card>
    </div>
  );
}
