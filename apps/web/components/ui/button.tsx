import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-transparent text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none disabled:saturate-50 disabled:opacity-60 aria-[busy=true]:pointer-events-none aria-[busy=true]:opacity-75",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_16px_36px_-20px_hsl(var(--primary)/0.88)] hover:translate-y-[-1px] hover:bg-primary/92",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_16px_36px_-20px_hsl(var(--secondary)/0.72)] hover:translate-y-[-1px] hover:bg-secondary/90",
        outline:
          "border-border/85 bg-card/92 text-foreground shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)] backdrop-blur-sm hover:border-primary/35 hover:bg-card hover:text-foreground",
        ghost:
          "border-transparent bg-transparent text-foreground/84 hover:bg-muted/88 hover:text-foreground",
        accent:
          "bg-accent text-accent-foreground shadow-[0_16px_36px_-20px_hsl(var(--accent)/0.72)] hover:translate-y-[-1px] hover:bg-accent/92",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
