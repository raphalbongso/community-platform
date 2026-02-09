interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status?: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusStyles = {
  completed: "bg-green-500",
  current: "bg-primary-600 ring-4 ring-primary-100",
  upcoming: "bg-gray-300",
};

export function Timeline({ items, className = "" }: TimelineProps) {
  return (
    <div className={`relative ${className}`}>
      {items.map((item, index) => {
        const status = item.status ?? "upcoming";
        return (
          <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {index < items.length - 1 && (
              <div className="absolute left-[9px] top-5 h-full w-0.5 bg-gray-200" />
            )}
            <div className="relative z-10 mt-1 flex-shrink-0">
              <div className={`h-5 w-5 rounded-full ${statusStyles[status]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${status === "upcoming" ? "text-gray-500" : "text-gray-900"}`}>
                {item.title}
              </p>
              {item.description && (
                <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
              )}
              {item.date && (
                <p className="mt-1 text-xs text-gray-400">{item.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
