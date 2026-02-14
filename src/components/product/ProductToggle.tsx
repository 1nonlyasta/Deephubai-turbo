import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const productToggleVariants = cva(
    "inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-transparent hover:bg-muted/50 text-foreground",
                outline: "border border-border/50 bg-transparent hover:bg-muted/50",
            },
            size: {
                default: "h-10 px-3 min-w-[40px]",
                sm: "h-8 px-2 min-w-[32px]",
                lg: "h-12 px-5 min-w-[48px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const ProductToggle = React.forwardRef<
    React.ElementRef<typeof TogglePrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof productToggleVariants>
>(({ className, variant, size, ...props }, ref) => (
    <TogglePrimitive.Root
        ref={ref}
        className={cn(
            productToggleVariants({ variant, size }),
            "data-[state=on]:bg-accent/10 data-[state=on]:text-accent data-[state=on]:border-accent/20",
            className
        )}
        {...props}
    />
));

ProductToggle.displayName = TogglePrimitive.Root.displayName;

export { ProductToggle, productToggleVariants };
export { ProductToggle as Toggle, productToggleVariants as toggleVariants };
