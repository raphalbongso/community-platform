interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  sections: SidebarSection[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({ sections, header, footer, className = "" }: SidebarProps) {
  return (
    <aside className={`flex h-full w-64 flex-col border-r border-gray-200 bg-white ${className}`}>
      {header && <div className="border-b border-gray-200 p-4">{header}</div>}
      <nav className="flex-1 overflow-y-auto p-4">
        {sections.map((section, i) => (
          <div key={i} className={i > 0 ? "mt-6" : ""}>
            {section.title && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon && <span className="h-5 w-5">{item.icon}</span>}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {footer && <div className="border-t border-gray-200 p-4">{footer}</div>}
    </aside>
  );
}
