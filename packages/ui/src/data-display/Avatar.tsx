interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base" };

export function Avatar({ src, alt = "", size = "md", className = "" }: AvatarProps) {
  if (src) {
    return <img src={src} alt={alt} className={`rounded-full object-cover ${sizeStyles[size]} ${className}`} />;
  }
  return (
    <div className={`rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium ${sizeStyles[size]} ${className}`}>
      {alt.charAt(0).toUpperCase()}
    </div>
  );
}
