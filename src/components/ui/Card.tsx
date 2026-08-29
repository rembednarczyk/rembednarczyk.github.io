import { HTMLAttributes, forwardRef } from "react";

/**
 * No page section imports this. That is deliberate and not an oversight.
 *
 * Card and Badge are design system primitives: they exist to be composed in
 * Storybook, which this repository treats as a deliverable rather than a
 * side effect. The AiAssistedCard story builds on both to model how the UI
 * behaves with unpredictable AI-generated content, and the three story files
 * carry seventeen axe assertions between them.
 *
 * A review has already read the missing imports as dead code and proposed
 * deleting them. Removing them would remove that showcase, so the reason is
 * recorded here rather than rediscovered each time.
 */
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
