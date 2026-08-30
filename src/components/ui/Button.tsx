import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
      secondary: "bg-purple-600 text-white hover:bg-purple-500",
      outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
      ghost: "bg-transparent hover:bg-slate-800 text-slate-200",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        // Says the control is working rather than broken. A disabled button
        // with a spinner in it reads as unavailable; aria-busy is what makes
        // it read as busy. Set before the spread so a caller can still
        // override it.
        aria-busy={isLoading}
        {...props}
      >
        {/*
          Beside the children, never instead of them. The contact form wrote
          out its own loading state and swapped its label for a bare spinner,
          which left the button with no accessible name for as long as the
          request was in flight — axe reports button-name, and a screen
          reader announces "button, dimmed" and nothing else. This prop
          existed for that and had no caller.
        */}
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
