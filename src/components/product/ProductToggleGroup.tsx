import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { productToggleVariants } from "./ProductToggle";

const ProductToggleGroupContext = React.createContext<VariantProps<typeof productToggleVariants>>({
    size: "default",
    variant: "default",
});

const ProductToggleGroup = React.forwardRef<
    React.ElementRef<typeof ToggleGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof productToggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
    <ToggleGroupPrimitive.Root
        ref={ref}
        type={Array.isArray(props.value) ? "multiple" : ("single" as any)}
        className={cn("flex items-center justify-center gap-1.5", className)}
        {...(props as any)}
    >
        <ProductToggleGroupContext.Provider value={{ variant, size }}>
            {children}
        </ProductToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
));

ProductToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ProductToggleGroupItem = React.forwardRef<
    React.ElementRef<typeof ToggleGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof productToggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
    const context = React.useContext(ProductToggleGroupContext);

    return (
        <ToggleGroupPrimitive.Item
            ref={ref}
            className={cn(
                productToggleVariants({
                    variant: context.variant || variant,
                    size: context.size || size,
                }),
                "rounded-lg transition-all data-[state=on]:bg-accent/10 data-[state=on]:text-accent data-[state=on]:shadow-[inset_0_0_10px_rgba(var(--accent),0.1)]",
                className
            )}
            {...props}
        >
            {children}
        </ToggleGroupPrimitive.Item>
    );
});

ProductToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ProductToggleGroup, ProductToggleGroupItem };
export { ProductToggleGroup as ToggleGroup, ProductToggleGroupItem as ToggleGroupItem };
