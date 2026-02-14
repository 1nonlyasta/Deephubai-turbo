import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "../../lib/utils";

const ProductDropdownMenu = DropdownMenuPrimitive.Root;
const ProductDropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const ProductDropdownMenuGroup = DropdownMenuPrimitive.Group;
const ProductDropdownMenuPortal = DropdownMenuPrimitive.Portal;
const ProductDropdownMenuSub = DropdownMenuPrimitive.Sub;
const ProductDropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const ProductDropdownMenuSubTrigger = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
        inset?: boolean;
    }
>(({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            inset && "pl-8",
            className,
        )}
        {...props}
    >
        {children}
        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
    </DropdownMenuPrimitive.SubTrigger>
));
ProductDropdownMenuSubTrigger.displayName = "ProductDropdownMenuSubTrigger";

const ProductDropdownMenuSubContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
        ref={ref}
        className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className,
        )}
        {...props}
    />
));
ProductDropdownMenuSubContent.displayName = "ProductDropdownMenuSubContent";

const ProductDropdownMenuContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                className,
            )}
            {...props}
        />
    </DropdownMenuPrimitive.Portal>
));
ProductDropdownMenuContent.displayName = "ProductDropdownMenuContent";

const ProductDropdownMenuItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
            inset && "pl-8",
            className,
        )}
        {...props}
    />
));
ProductDropdownMenuItem.displayName = "ProductDropdownMenuItem";

const ProductDropdownMenuCheckboxItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
            className,
        )}
        checked={checked}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <Check className="h-4 w-4 stroke-[3px]" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
));
ProductDropdownMenuCheckboxItem.displayName = "ProductDropdownMenuCheckboxItem";

const ProductDropdownMenuRadioItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
            className,
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <Circle className="h-2 w-2 fill-current" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
));
ProductDropdownMenuRadioItem.displayName = "ProductDropdownMenuRadioItem";

const ProductDropdownMenuLabel = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground/70", inset && "pl-8", className)}
        {...props}
    />
));
ProductDropdownMenuLabel.displayName = "ProductDropdownMenuLabel";

const ProductDropdownMenuSeparator = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border/50", className)} {...props} />
));
ProductDropdownMenuSeparator.displayName = "ProductDropdownMenuSeparator";

const ProductDropdownMenuShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return <span className={cn("ml-auto text-[10px] tracking-widest text-muted-foreground opacity-50", className)} {...props} />;
};
ProductDropdownMenuShortcut.displayName = "ProductDropdownMenuShortcut";

export {
    ProductDropdownMenu,
    ProductDropdownMenuTrigger,
    ProductDropdownMenuContent,
    ProductDropdownMenuItem,
    ProductDropdownMenuCheckboxItem,
    ProductDropdownMenuRadioItem,
    ProductDropdownMenuLabel,
    ProductDropdownMenuSeparator,
    ProductDropdownMenuShortcut,
    ProductDropdownMenuGroup,
    ProductDropdownMenuPortal,
    ProductDropdownMenuSub,
    ProductDropdownMenuSubContent,
    ProductDropdownMenuSubTrigger,
    ProductDropdownMenuRadioGroup,
};
export {
    ProductDropdownMenu as DropdownMenu,
    ProductDropdownMenuTrigger as DropdownMenuTrigger,
    ProductDropdownMenuContent as DropdownMenuContent,
    ProductDropdownMenuItem as DropdownMenuItem,
    ProductDropdownMenuCheckboxItem as DropdownMenuCheckboxItem,
    ProductDropdownMenuRadioItem as DropdownMenuRadioItem,
    ProductDropdownMenuLabel as DropdownMenuLabel,
    ProductDropdownMenuSeparator as DropdownMenuSeparator,
    ProductDropdownMenuShortcut as DropdownMenuShortcut,
    ProductDropdownMenuGroup as DropdownMenuGroup,
    ProductDropdownMenuPortal as DropdownMenuPortal,
    ProductDropdownMenuSub as DropdownMenuSub,
    ProductDropdownMenuSubContent as DropdownMenuSubContent,
    ProductDropdownMenuSubTrigger as DropdownMenuSubTrigger,
    ProductDropdownMenuRadioGroup as DropdownMenuRadioGroup,
};
