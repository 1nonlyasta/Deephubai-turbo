import { cn } from "../../lib/utils"

function ProductSkeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export { ProductSkeleton, ProductSkeleton as Skeleton }
