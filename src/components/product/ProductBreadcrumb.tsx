import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "../../lib/utils";

const ProductBreadcrumb = React.forwardRef<
    HTMLElement,
    React.ComponentPropsWithoutRef<"nav">
>(({ ...props }, ref) => (
    <nav ref={ref} aria-label="breadcrumb" {...props} />
));
ProductBreadcrumb.displayName = "ProductBreadcrumb";

const ProductBreadcrumbList = React.forwardRef<
    HTMLOListElement,
    React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn(
            "flex flex-wrap items-center gap-1.5 break-words text-xs uppercase tracking-wider text-muted-foreground sm:gap-2.5",
            className
        )}
        {...props}
    />
));
ProductBreadcrumbList.displayName = "ProductBreadcrumbList";

const ProductBreadcrumbItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
));
ProductBreadcrumbItem.displayName = "ProductBreadcrumbItem";

const ProductBreadcrumbLink = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    return (
        <Comp
            ref={ref}
            className={cn("transition-colors hover:text-accent duration-300", className)}
            {...props}
        />
    );
});
ProductBreadcrumbLink.displayName = "ProductBreadcrumbLink";

const ProductBreadcrumbPage = React.forwardRef<
    HTMLSpanElement,
    React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn("font-medium text-foreground", className)}
        {...props}
    />
));
ProductBreadcrumbPage.displayName = "ProductBreadcrumbPage";

const ProductBreadcrumbSeparator = ({
    children,
    className,
    ...props
}: React.ComponentProps<"li">) => (
    <li
        role="presentation"
        aria-hidden="true"
        className={cn("[&>svg]:size-3.5 text-muted-foreground/50", className)}
        {...props}
    >
        {children ?? <ChevronRight />}
    </li>
);
ProductBreadcrumbSeparator.displayName = "ProductBreadcrumbSeparator";

const ProductBreadcrumbEllipsis = ({
    className,
    ...props
}: React.ComponentProps<"span">) => (
    <span
        role="presentation"
        aria-hidden="true"
        className={cn("flex h-9 w-9 items-center justify-center", className)}
        {...props}
    >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More</span>
    </span>
);
ProductBreadcrumbEllipsis.displayName = "ProductBreadcrumbEllipsis";

export {
    ProductBreadcrumb,
    ProductBreadcrumbList,
    ProductBreadcrumbItem,
    ProductBreadcrumbLink,
    ProductBreadcrumbPage,
    ProductBreadcrumbSeparator,
    ProductBreadcrumbEllipsis,
};
export {
    ProductBreadcrumb as Breadcrumb,
    ProductBreadcrumbList as BreadcrumbList,
    ProductBreadcrumbItem as BreadcrumbItem,
    ProductBreadcrumbLink as BreadcrumbLink,
    ProductBreadcrumbPage as BreadcrumbPage,
    ProductBreadcrumbSeparator as BreadcrumbSeparator,
    ProductBreadcrumbEllipsis as BreadcrumbEllipsis,
};
