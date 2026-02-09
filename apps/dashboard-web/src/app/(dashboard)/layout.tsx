export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-lg font-bold mb-8">Creator Dashboard</h2>
          <nav className="space-y-1">
            <a href="/" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Overview</a>
            <div className="pt-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Initiatives</p>
              <a href="/initiatives" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">All Initiatives</a>
            </div>
            <div className="pt-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</p>
              <a href="/content/posts" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Posts</a>
              <a href="/content/drops" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Drops</a>
            </div>
            <div className="pt-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Supporters</p>
              <a href="/supporters" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Registry</a>
              <a href="/supporters/snapshots" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Snapshots</a>
            </div>
            <div className="pt-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Financials</p>
              <a href="/financials/sales" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Sales Ledger</a>
            </div>
            <div className="pt-4">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Offers</p>
              <a href="/offers" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Acquisition Offers</a>
            </div>
            <div className="pt-4">
              <a href="/settings" className="block px-3 py-2 rounded-md text-sm hover:bg-gray-800">Settings</a>
            </div>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
