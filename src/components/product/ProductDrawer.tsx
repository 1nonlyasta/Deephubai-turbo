import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "../../lib/utils";

const ProductDrawer = ({
    shouldScaleBackground = true,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
    <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
ProductDrawer.displayName = "ProductDrawer";

const ProductDrawerTrigger = DrawerPrimitive.Trigger;

const ProductDrawerPortal = DrawerPrimitive.Portal;

const ProductDrawerClose = DrawerPrimitive.Close;

const ProductDrawerOverlay = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-black/40 backdrop-blur-sm", className)}
        {...props}
    />
));
ProductDrawerOverlay.displayName = "ProductDrawerOverlay";

const ProductDrawerContent = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <ProductDrawerPortal>
        <ProductDrawerOverlay />
        <DrawerPrimitive.Content
            ref={ref}
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl border border-border/50 bg-background shadow-2xl",
                className,
            )}
            {...props}
        >
            <div className="mx-auto mt-4 h-1.5 w-[60px] rounded-full bg-muted/60" />
            {children}
        </DrawerPrimitive.Content>
    </ProductDrawerPortal>
));
ProductDrawerContent.displayName = "ProductDrawerContent";

const ProductDrawerHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("grid gap-1.5 p-6 text-center sm:text-left", className)} {...props} />
);
ProductDrawerHeader.displayName = "ProductDrawerHeader";

const ProductDrawerFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mt-auto flex flex-col gap-2 p-6", className)} {...props} />
);
ProductDrawerFooter.displayName = "ProductDrawerFooter";

const ProductDrawerTitle = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
        ref={ref}
        className={cn("text-xl font-display font-semibold leading-none tracking-tight text-foreground", className)}
        {...props}
    />
));
ProductDrawerTitle.displayName = "ProductDrawerTitle";

const ProductDrawerDescription = React.forwardRef<
    React.ElementRef<typeof DrawerPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground font-light leading-relaxed", className)}
        {...props}
    />
));
ProductDrawerDescription.displayName = "ProductDrawerDescription";

export {
    ProductDrawer,
    ProductDrawerPortal,
    ProductDrawerOverlay,
    ProductDrawerTrigger,
    ProductDrawerClose,
    ProductDrawerContent,
    ProductDrawerHeader,
    ProductDrawerFooter,
    ProductDrawerTitle,
    ProductDrawerDescription,
};
export {
    ProductDrawer as Drawer,
    ProductDrawerPortal as DrawerPortal,
    ProductDrawerOverlay as DrawerOverlay,
    ProductDrawerTrigger as DrawerTrigger,
    ProductDrawerClose as DrawerClose,
    ProductDrawerContent as DrawerContent,
    ProductDrawerHeader as DrawerHeader,
    ProductDrawerFooter as DrawerFooter,
    ProductDrawerTitle as DrawerTitle,
    ProductDrawerDescription as DrawerDescription,
};
