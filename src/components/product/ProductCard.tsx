import * as React from "react";
import { cn } from "../../lib/utils";

const ProductCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-2xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:border-accent/20",
            className
        )}
        {...props}
    />
));
ProductCard.displayName = "ProductCard";

const ProductCardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
ProductCardHeader.displayName = "ProductCardHeader";

const ProductCardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-xl font-display font-semibold leading-none tracking-tight text-foreground",
            className
        )}
        {...props}
    />
));
ProductCardTitle.displayName = "ProductCardTitle";

const ProductCardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground font-light leading-relaxed", className)}
        {...props}
    />
));
ProductCardDescription.displayName = "ProductCardDescription";

const ProductCardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
ProductCardContent.displayName = "ProductCardContent";

const ProductCardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
ProductCardFooter.displayName = "ProductCardFooter";

export {
    ProductCard,
    ProductCard as Card,
    ProductCardHeader as CardHeader,
    ProductCardFooter as CardFooter,
    ProductCardTitle as CardTitle,
    ProductCardDescription as CardDescription,
    ProductCardContent as CardContent,
};
