import { HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "outline";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "glass", children, ...props }, ref) => {
    const baseStyles = "rounded-xl overflow-hidden";
    
    const variants = {
      glass: "bg-slate-900/50 backdrop-blur-md border border-slate-800 shadow-xl",
      solid: "bg-slate-900 border border-slate-800",
      outline: "bg-transparent border border-slate-700",
    };

    const classes = `${baseStyles} ${variants[variant]} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
