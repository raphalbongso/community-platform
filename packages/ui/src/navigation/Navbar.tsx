interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  brand: React.ReactNode;
  items: NavItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function Navbar({ brand, items, actions, className = "" }: NavbarProps) {
  return (
    <header className={`border-b border-gray-200 bg-white ${className}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <div className="text-lg font-bold text-gray-900">{brand}</div>
          <nav className="hidden md:flex items-center gap-6">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.active
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}
