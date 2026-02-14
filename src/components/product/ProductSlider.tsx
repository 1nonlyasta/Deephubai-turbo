import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../../lib/utils";

const ProductSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
        )}
        {...props}
    >
        <SliderPrimitive.Track
            className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary/50 backdrop-blur-sm"
        >
            <SliderPrimitive.Range className="absolute h-full bg-accent" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
            className={cn(
                "block h-5 w-5 rounded-full border-2 border-accent bg-background shadow-lg transition-all",
                "hover:scale-110 hover:shadow-[0_0_10px_rgba(var(--accent),0.4)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                "active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            )}
        />
    </SliderPrimitive.Root>
));

ProductSlider.displayName = "ProductSlider";

export { ProductSlider, ProductSlider as Slider };
