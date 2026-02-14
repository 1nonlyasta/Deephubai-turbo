import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../lib/utils";

const ProductTabs = TabsPrimitive.Root;

const ProductTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-11 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground backdrop-blur-sm border border-border/40",
            className
        )}
        {...props}
    />
));
ProductTabsList.displayName = "ProductTabsList";

const ProductTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium ring-offset-background transition-all",
            "data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50 hover:text-foreground/80",
            className
        )}
        {...props}
    />
));
ProductTabsTrigger.displayName = "ProductTabsTrigger";

const ProductTabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 animate-in fade-in-50 duration-300",
            className
        )}
        {...props}
    />
));
ProductTabsContent.displayName = "ProductTabsContent";

export { ProductTabs, ProductTabsList, ProductTabsTrigger, ProductTabsContent };
export {
    ProductTabs as Tabs,
    ProductTabsList as TabsList,
    ProductTabsTrigger as TabsTrigger,
    ProductTabsContent as TabsContent,
};
