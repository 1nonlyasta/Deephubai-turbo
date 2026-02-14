import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "../../lib/utils";

const ProductScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ProductScrollBar />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
));
ProductScrollArea.displayName = "ProductScrollArea";

const ProductScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            "flex touch-none select-none transition-all duration-300 ease-in-out",
            orientation === "vertical" && "h-full w-2 border-l border-l-transparent p-[1px]",
            orientation === "horizontal" && "h-2 flex-col border-t border-t-transparent p-[1px]",
            className
        )}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb
            className="relative flex-1 rounded-full bg-border/60 transition-colors hover:bg-accent/80 active:bg-accent"
        />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ProductScrollBar.displayName = "ProductScrollBar";

export { ProductScrollArea, ProductScrollBar };
export { ProductScrollArea as ScrollArea, ProductScrollBar as ScrollBar };
