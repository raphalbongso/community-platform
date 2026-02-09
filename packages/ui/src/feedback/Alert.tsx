type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

export function Alert({ variant = "info", title, children, className = "" }: AlertProps) {
  return (
    <div className={`rounded-lg border p-4 text-sm ${variantStyles[variant]} ${className}`}>
      {title && <p className="font-medium mb-1">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
