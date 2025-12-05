import React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export function Alert({ className = "", variant = "default", ...props }: AlertProps) {
  const variantClasses = {
    default: "bg-slate-800/50 text-white border-slate-700",
    destructive: "bg-red-900/20 text-red-300 border-red-700",
  };

  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function AlertDescription({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`text-sm ${className}`}
      {...props}
    />
  );
}