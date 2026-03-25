import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "success" | "error";
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", icon, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950";
    
    const variants = {
      default: "bg-slate-800 text-slate-100 hover:bg-slate-700",
      outline: "text-slate-300 border border-slate-700 hover:bg-slate-800",
      success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      error: "bg-red-500/10 text-red-400 border border-red-500/20",
    };

    const classes = `${baseStyles} ${variants[variant]} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {icon && <span className="mr-1.5 flex items-center">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";
