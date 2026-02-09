import { Card } from "@community/ui";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, change, trend }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {change && (
        <p className={`text-xs mt-1 ${
          trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-400"
        }`}>
          {change}
        </p>
      )}
    </Card>
  );
}
