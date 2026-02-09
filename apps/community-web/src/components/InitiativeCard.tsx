import { Card, Badge } from "@community/ui";

interface InitiativeCardProps {
  initiative: {
    id: string;
    title: string;
    slug: string;
    intentText: string;
    coverUrl: string | null;
    status: string;
    supporterCount: number;
    creator?: {
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  };
}

const statusColors: Record<string, string> = {
  ACTIVE: "success",
  COMPLETED: "default",
  PAUSED: "warning",
};

export function InitiativeCard({ initiative }: InitiativeCardProps) {
  return (
    <a href={`/initiative/${initiative.slug}`} className="block group">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {initiative.coverUrl && (
          <div className="h-40 -mx-4 -mt-4 mb-4 bg-gray-100 overflow-hidden">
            <img
              src={initiative.coverUrl}
              alt={initiative.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={statusColors[initiative.status] as "success" | "default" | "warning" ?? "default"}>
            {initiative.status}
          </Badge>
          <span className="text-xs text-gray-400">{initiative.supporterCount} supporters</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
          {initiative.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{initiative.intentText}</p>
        {initiative.creator && (
          <p className="text-xs text-gray-400 mt-3">by {initiative.creator.displayName}</p>
        )}
      </Card>
    </a>
  );
}
