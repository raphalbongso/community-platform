export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-8">
          <span className="text-xl font-bold text-primary-600">Community</span>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <a href="/" className="hover:text-gray-900">Feed</a>
            <a href="/discover" className="hover:text-gray-900">Discover</a>
            <a href="/communities" className="hover:text-gray-900">Communities</a>
            <a href="/profile" className="hover:text-gray-900">Profile</a>
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          Support is voluntary and creator-defined. This platform does not offer financial returns.
        </div>
      </footer>
    </div>
  );
}
