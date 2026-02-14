import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "../../lib/utils";

const ProductAvatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/40", className)}
        {...props}
    />
));
ProductAvatar.displayName = "ProductAvatar";

const ProductAvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
    />
));
ProductAvatarImage.displayName = "ProductAvatarImage";

const ProductAvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-card text-muted-foreground font-medium text-xs",
            className
        )}
        {...props}
    />
));
ProductAvatarFallback.displayName = "ProductAvatarFallback";

export {
    ProductAvatar,
    ProductAvatarImage,
    ProductAvatarFallback,
};
export {
    ProductAvatar as Avatar,
    ProductAvatarImage as AvatarImage,
    ProductAvatarFallback as AvatarFallback,
};
