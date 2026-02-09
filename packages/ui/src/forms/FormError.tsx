interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={`rounded-lg border border-error-200 bg-error-50 p-3 ${className}`}>
      <p className="text-sm text-error-700">{message}</p>
    </div>
  );
}
