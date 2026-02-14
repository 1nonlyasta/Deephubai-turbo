import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./ProductButton";

const ProductAlertDialog = AlertDialogPrimitive.Root;

const ProductAlertDialogTrigger = AlertDialogPrimitive.Trigger;

const ProductAlertDialogPortal = AlertDialogPrimitive.Portal;

const ProductAlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className,
        )}
        {...props}
        ref={ref}
    />
));
ProductAlertDialogOverlay.displayName = "ProductAlertDialogOverlay";

const ProductAlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
    <ProductAlertDialogPortal>
        <ProductAlertDialogOverlay />
        <AlertDialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/50 bg-background p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl",
                className,
            )}
            {...props}
        />
    </ProductAlertDialogPortal>
));
ProductAlertDialogContent.displayName = "ProductAlertDialogContent";

const ProductAlertDialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
ProductAlertDialogHeader.displayName = "ProductAlertDialogHeader";

const ProductAlertDialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
ProductAlertDialogFooter.displayName = "ProductAlertDialogFooter";

const ProductAlertDialogTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-display font-semibold tracking-tight", className)}
        {...props}
    />
));
ProductAlertDialogTitle.displayName = "ProductAlertDialogTitle";

const ProductAlertDialogDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground font-light", className)}
        {...props}
    />
));
ProductAlertDialogDescription.displayName = "ProductAlertDialogDescription";

const ProductAlertDialogAction = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action
        ref={ref}
        className={cn(buttonVariants(), "bg-accent text-accent-foreground hover:opacity-90", className)}
        {...props}
    />
));
ProductAlertDialogAction.displayName = "ProductAlertDialogAction";

const ProductAlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0 border-border/50 hover:bg-muted", className)}
        {...props}
    />
));
ProductAlertDialogCancel.displayName = "ProductAlertDialogCancel";

export {
    ProductAlertDialog as AlertDialog,
    ProductAlertDialogPortal as AlertDialogPortal,
    ProductAlertDialogOverlay as AlertDialogOverlay,
    ProductAlertDialogTrigger as AlertDialogTrigger,
    ProductAlertDialogContent as AlertDialogContent,
    ProductAlertDialogHeader as AlertDialogHeader,
    ProductAlertDialogFooter as AlertDialogFooter,
    ProductAlertDialogTitle as AlertDialogTitle,
    ProductAlertDialogDescription as AlertDialogDescription,
    ProductAlertDialogAction as AlertDialogAction,
    ProductAlertDialogCancel as AlertDialogCancel,
};
