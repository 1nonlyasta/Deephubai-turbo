import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const productBadgeVariants = cva(
    "inline-flex items-center rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground border-border/50",
                accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_10px_rgba(255,191,0,0.1)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof productBadgeVariants> { }

function ProductBadge({ className, variant, ...props }: BadgeProps) {
    return (
        <div
            className={cn(productBadgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { ProductBadge, ProductBadge as Badge, productBadgeVariants as badgeVariants };
