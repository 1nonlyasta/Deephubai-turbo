import * as React from "react";
import { cn } from "../../lib/utils";

const ProductTable = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
        <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
));
ProductTable.displayName = "ProductTable";

const ProductTableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b border-border/50 bg-muted/30", className)} {...props} />
));
ProductTableHeader.displayName = "ProductTableHeader";

const ProductTableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
ProductTableBody.displayName = "ProductTableBody";

const ProductTableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
        {...props}
    />
));
ProductTableFooter.displayName = "ProductTableFooter";

const ProductTableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b border-border/40 transition-colors data-[state=selected]:bg-accent/10 hover:bg-accent/5",
            className
        )}
        {...props}
    />
));
ProductTableRow.displayName = "ProductTableRow";

const ProductTableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-4 text-left align-middle font-display font-semibold text-muted-foreground uppercase tracking-wider text-[11px] [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
));
ProductTableHead.displayName = "ProductTableHead";

const ProductTableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
));
ProductTableCell.displayName = "ProductTableCell";

const ProductTableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground italic", className)} {...props} />
));
ProductTableCaption.displayName = "ProductTableCaption";

export {
    ProductTable,
    ProductTableHeader,
    ProductTableBody,
    ProductTableFooter,
    ProductTableHead,
    ProductTableRow,
    ProductTableCell,
    ProductTableCaption,
};
export {
    ProductTable as Table,
    ProductTableHeader as TableHeader,
    ProductTableBody as TableBody,
    ProductTableFooter as TableFooter,
    ProductTableHead as TableHead,
    ProductTableRow as TableRow,
    ProductTableCell as TableCell,
    ProductTableCaption as TableCaption,
};
