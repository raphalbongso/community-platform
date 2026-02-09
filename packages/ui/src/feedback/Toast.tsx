"use client";

import { useEffect, useState } from "react";

type ToastVariant = "info" | "success" | "warning" | "error";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

const variantStyles: Record<ToastVariant, string> = {
  info: "bg-blue-600",
  success: "bg-green-600",
  warning: "bg-yellow-500",
  error: "bg-red-600",
};

export function Toast({ message, variant = "info", duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${variantStyles[variant]}`}
      role="alert"
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="ml-2 text-white/80 hover:text-white"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
}
