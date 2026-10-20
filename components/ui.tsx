import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  size?: "default" | "sm";
};

const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-border bg-transparent hover:border-primary hover:text-primary",
};

export function Button({ variant = "primary", size = "default", className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-sm text-xs font-bold uppercase tracking-wider transition disabled:pointer-events-none disabled:opacity-50 ${size === "sm" ? "h-9 px-3" : "h-11 px-5"} ${variants[variant]} ${className}`}
    />
  );
}
