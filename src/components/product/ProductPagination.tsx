import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "../../lib/utils";
import { ProductButton, buttonVariants } from "../../components/product/ProductButton";

const ProductPagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
    />
);
ProductPagination.displayName = "ProductPagination";

const ProductPaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
    ({ className, ...props }, ref) => (
        <ul ref={ref} className={cn("flex flex-row items-center gap-1", className)} {...props} />
    ),
);
ProductPaginationContent.displayName = "ProductPaginationContent";

const ProductPaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
));
ProductPaginationItem.displayName = "ProductPaginationItem";

type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React.ComponentProps<typeof ProductButton>, "size"> &
    React.ComponentProps<"a">;

const ProductPaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
    <a
        aria-current={isActive ? "page" : undefined}
        className={cn(
            buttonVariants({
                variant: isActive ? "outline" : "ghost",
                size,
            }),
            className,
        )}
        {...props}
    />
);
ProductPaginationLink.displayName = "ProductPaginationLink";

const ProductPaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof ProductPaginationLink>) => (
    <ProductPaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 pl-2.5", className)} {...props}>
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
    </ProductPaginationLink>
);
ProductPaginationPrevious.displayName = "ProductPaginationPrevious";

const ProductPaginationNext = ({ className, ...props }: React.ComponentProps<typeof ProductPaginationLink>) => (
    <ProductPaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 pr-2.5", className)} {...props}>
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
    </ProductPaginationLink>
);
ProductPaginationNext.displayName = "ProductPaginationNext";

const ProductPaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
    <span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
    </span>
);
ProductPaginationEllipsis.displayName = "ProductPaginationEllipsis";

export {
    ProductPagination,
    ProductPaginationContent,
    ProductPaginationEllipsis,
    ProductPaginationItem,
    ProductPaginationLink,
    ProductPaginationNext,
    ProductPaginationPrevious,
};
export {
    ProductPagination as Pagination,
    ProductPaginationContent as PaginationContent,
    ProductPaginationEllipsis as PaginationEllipsis,
    ProductPaginationItem as PaginationItem,
    ProductPaginationLink as PaginationLink,
    ProductPaginationNext as PaginationNext,
    ProductPaginationPrevious as PaginationPrevious,
};
