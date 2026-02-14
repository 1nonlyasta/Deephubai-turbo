import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const alertVariants = cva(
    "relative w-full rounded-2xl border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground border-border/50",
                destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

const ProductAlert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
    />
));
ProductAlert.displayName = "ProductAlert";

const ProductAlertTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn("mb-1 font-display font-medium leading-none tracking-tight", className)}
        {...props}
    />
));
ProductAlertTitle.displayName = "ProductAlertTitle";

const ProductAlertDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm font-light text-muted-foreground [&_p]:leading-relaxed", className)}
        {...props}
    />
));
ProductAlertDescription.displayName = "ProductAlertDescription";

export {
    ProductAlert,
    ProductAlertTitle,
    ProductAlertDescription,
};
export {
    ProductAlert as Alert,
    ProductAlertTitle as AlertTitle,
    ProductAlertDescription as AlertDescription,
};
