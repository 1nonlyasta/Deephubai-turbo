import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const ProductTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-xl border border-border/50 bg-background px-4 py-3 text-sm ring-offset-background transition-all",
                    "placeholder:text-muted-foreground/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
ProductTextarea.displayName = "ProductTextarea";

export { ProductTextarea, ProductTextarea as Textarea };
