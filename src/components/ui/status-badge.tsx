import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses = {
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  error: "bg-destructive-light text-destructive",
  info: "bg-accent text-accent-foreground",
};

const StatusBadge = ({ variant, children, className, dot = false }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "success" && "bg-success",
          variant === "warning" && "bg-warning",
          variant === "error" && "bg-destructive",
          variant === "info" && "bg-accent-foreground"
        )} />
      )}
      {children}
    </span>
  );
};

export default StatusBadge;