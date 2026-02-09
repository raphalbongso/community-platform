interface DividerProps {
  className?: string;
}

export function Divider({ className = "" }: DividerProps) {
  return <hr className={`border-gray-200 ${className}`} />;
}
