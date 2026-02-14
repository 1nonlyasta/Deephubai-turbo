import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";

const ProductNavigationMenu = React.forwardRef<
    React.ElementRef<typeof NavigationMenuPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Root
        ref={ref}
        className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
        {...props}
    >
        {children}
        <ProductNavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
));
ProductNavigationMenu.displayName = "ProductNavigationMenu";

const ProductNavigationMenuList = React.forwardRef<
    React.ElementRef<typeof NavigationMenuPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.List
        ref={ref}
        className={cn("group flex flex-1 list-none items-center justify-center space-x-1", className)}
        {...props}
    />
));
ProductNavigationMenuList.displayName = "ProductNavigationMenuList";

const ProductNavigationMenuItem = NavigationMenuPrimitive.Item;

const productNavigationMenuTriggerStyle = cva(
    "group inline-flex h-10 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-all hover:bg-accent/10 hover:text-accent focus:bg-accent/10 focus:text-accent focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/10 data-[active]:text-accent data-[state=open]:bg-accent/10"
);

const ProductNavigationMenuTrigger = React.forwardRef<
    React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <NavigationMenuPrimitive.Trigger
        ref={ref}
        className={cn(productNavigationMenuTriggerStyle(), "group", className)}
        {...props}
    >
        {children}
        <ChevronDown
            className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180"
            aria-hidden="true"
        />
    </NavigationMenuPrimitive.Trigger>
));
ProductNavigationMenuTrigger.displayName = "ProductNavigationMenuTrigger";

const ProductNavigationMenuContent = React.forwardRef<
    React.ElementRef<typeof NavigationMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Content
        ref={ref}
        className={cn(
            "left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto",
            className
        )}
        {...props}
    />
));
ProductNavigationMenuContent.displayName = "ProductNavigationMenuContent";

const ProductNavigationMenuLink = NavigationMenuPrimitive.Link;

const ProductNavigationMenuViewport = React.forwardRef<
    React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
    <div className={cn("absolute left-0 top-full flex justify-center")}>
        <NavigationMenuPrimitive.Viewport
            className={cn(
                "origin-top-center relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-xl border border-border/40 bg-popover/95 backdrop-blur-md text-popover-foreground shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)] transition-[width,height] duration-300",
                className
            )}
            ref={ref}
            {...props}
        />
    </div>
));
ProductNavigationMenuViewport.displayName = "ProductNavigationMenuViewport";

const ProductNavigationMenuIndicator = React.forwardRef<
    React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
    <NavigationMenuPrimitive.Indicator
        ref={ref}
        className={cn(
            "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
            className
        )}
        {...props}
    >
        <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
    </NavigationMenuPrimitive.Indicator>
));
ProductNavigationMenuIndicator.displayName = "ProductNavigationMenuIndicator";

export {
    productNavigationMenuTriggerStyle,
    ProductNavigationMenu,
    ProductNavigationMenuList,
    ProductNavigationMenuItem,
    ProductNavigationMenuContent,
    ProductNavigationMenuTrigger,
    ProductNavigationMenuLink,
    ProductNavigationMenuIndicator,
    ProductNavigationMenuViewport,
};
export {
    productNavigationMenuTriggerStyle as navigationMenuTriggerStyle,
    ProductNavigationMenu as NavigationMenu,
    ProductNavigationMenuList as NavigationMenuList,
    ProductNavigationMenuItem as NavigationMenuItem,
    ProductNavigationMenuContent as NavigationMenuContent,
    ProductNavigationMenuTrigger as NavigationMenuTrigger,
    ProductNavigationMenuLink as NavigationMenuLink,
    ProductNavigationMenuIndicator as NavigationMenuIndicator,
    ProductNavigationMenuViewport as NavigationMenuViewport,
};
