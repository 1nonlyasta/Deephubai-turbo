import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "../../lib/utils";

const ProductContextMenu = ContextMenuPrimitive.Root;
const ProductContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ProductContextMenuGroup = ContextMenuPrimitive.Group;
const ProductContextMenuPortal = ContextMenuPrimitive.Portal;
const ProductContextMenuSub = ContextMenuPrimitive.Sub;
const ProductContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ProductContextMenuSubTrigger = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.SubTrigger>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
        inset?: boolean;
    }
>(({ className, inset, children, ...props }, ref) => (
    <ContextMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            inset && "pl-8",
            className,
        )}
        {...props}
    >
        {children}
        <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
    </ContextMenuPrimitive.SubTrigger>
));
ProductContextMenuSubTrigger.displayName = "ProductContextMenuSubTrigger";

const ProductContextMenuSubContent = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.SubContent>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
    <ContextMenuPrimitive.SubContent
        ref={ref}
        className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className,
        )}
        {...props}
    />
));
ProductContextMenuSubContent.displayName = "ProductContextMenuSubContent";

const ProductContextMenuContent = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
            ref={ref}
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                className,
            )}
            {...props}
        />
    </ContextMenuPrimitive.Portal>
));
ProductContextMenuContent.displayName = "ProductContextMenuContent";

const ProductContextMenuItem = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <ContextMenuPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
            inset && "pl-8",
            className,
        )}
        {...props}
    />
));
ProductContextMenuItem.displayName = "ProductContextMenuItem";

const ProductContextMenuCheckboxItem = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.CheckboxItem>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
    <ContextMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
            className,
        )}
        checked={checked}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <ContextMenuPrimitive.ItemIndicator>
                <Check className="h-4 w-4 stroke-[3px]" />
            </ContextMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </ContextMenuPrimitive.CheckboxItem>
));
ProductContextMenuCheckboxItem.displayName = "ProductContextMenuCheckboxItem";

const ProductContextMenuRadioItem = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.RadioItem>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
    <ContextMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
            className,
        )}
        {...props}
    >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <ContextMenuPrimitive.ItemIndicator>
                <Circle className="h-2 w-2 fill-current" />
            </ContextMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </ContextMenuPrimitive.RadioItem>
));
ProductContextMenuRadioItem.displayName = "ProductContextMenuRadioItem";

const ProductContextMenuLabel = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <ContextMenuPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground", inset && "pl-8", className)}
        {...props}
    />
));
ProductContextMenuLabel.displayName = "ProductContextMenuLabel";

const ProductContextMenuSeparator = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <ContextMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-border/50", className)} {...props} />
));
ProductContextMenuSeparator.displayName = "ProductContextMenuSeparator";

const ProductContextMenuShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return <span className={cn("ml-auto text-[10px] tracking-widest text-muted-foreground opacity-60", className)} {...props} />;
};
ProductContextMenuShortcut.displayName = "ProductContextMenuShortcut";

export {
    ProductContextMenu,
    ProductContextMenuTrigger,
    ProductContextMenuContent,
    ProductContextMenuItem,
    ProductContextMenuCheckboxItem,
    ProductContextMenuRadioItem,
    ProductContextMenuLabel,
    ProductContextMenuSeparator,
    ProductContextMenuShortcut,
    ProductContextMenuGroup,
    ProductContextMenuPortal,
    ProductContextMenuSub,
    ProductContextMenuSubContent,
    ProductContextMenuSubTrigger,
    ProductContextMenuRadioGroup,
};
export {
    ProductContextMenu as ContextMenu,
    ProductContextMenuTrigger as ContextMenuTrigger,
    ProductContextMenuContent as ContextMenuContent,
    ProductContextMenuItem as ContextMenuItem,
    ProductContextMenuCheckboxItem as ContextMenuCheckboxItem,
    ProductContextMenuRadioItem as ContextMenuRadioItem,
    ProductContextMenuLabel as ContextMenuLabel,
    ProductContextMenuSeparator as ContextMenuSeparator,
    ProductContextMenuShortcut as ContextMenuShortcut,
    ProductContextMenuGroup as ContextMenuGroup,
    ProductContextMenuPortal as ContextMenuPortal,
    ProductContextMenuSub as ContextMenuSub,
    ProductContextMenuSubContent as ContextMenuSubContent,
    ProductContextMenuSubTrigger as ContextMenuSubTrigger,
    ProductContextMenuRadioGroup as ContextMenuRadioGroup,
};
