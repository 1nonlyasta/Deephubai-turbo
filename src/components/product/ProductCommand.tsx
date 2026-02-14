import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "../../lib/utils";
import { Dialog, DialogContent } from "./ProductDialog";

const ProductCommand = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
    <CommandPrimitive
        ref={ref}
        className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-popover text-popover-foreground",
            className,
        )}
        {...props}
    />
));
ProductCommand.displayName = "ProductCommand";

const ProductCommandDialog = ({
    children,
    ...props
}: React.ComponentPropsWithoutRef<typeof Dialog>) => {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 shadow-2xl border-border/50">
                <ProductCommand className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-display [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    {children}
                </ProductCommand>
            </DialogContent>
        </Dialog>
    );
};

const ProductCommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <div className="flex items-center border-b border-border/50 px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-accent" />
        <CommandPrimitive.Input
            ref={ref}
            className={cn(
                "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-light",
                className,
            )}
            {...props}
        />
    </div>
));
ProductCommandInput.displayName = "ProductCommandInput";

const ProductCommandList = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.List
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        {...props}
    />
));
ProductCommandList.displayName = "ProductCommandList";

const ProductCommandEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
    <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm text-muted-foreground" {...props} />
));
ProductCommandEmpty.displayName = "ProductCommandEmpty";

const ProductCommandGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn(
            "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground/70",
            className,
        )}
        {...props}
    />
));
ProductCommandGroup.displayName = "ProductCommandGroup";

const ProductCommandSeparator = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border/50", className)} {...props} />
));
ProductCommandSeparator.displayName = "ProductCommandSeparator";

const ProductCommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-xl px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 transition-colors duration-200",
            className,
        )}
        {...props}
    />
));
ProductCommandItem.displayName = "ProductCommandItem";

const ProductCommandShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn("ml-auto text-[10px] tracking-widest text-muted-foreground opacity-60", className)}
            {...props}
        />
    );
};
ProductCommandShortcut.displayName = "ProductCommandShortcut";

export {
    ProductCommand,
    ProductCommandDialog,
    ProductCommandInput,
    ProductCommandList,
    ProductCommandEmpty,
    ProductCommandGroup,
    ProductCommandItem,
    ProductCommandShortcut,
    ProductCommandSeparator,
};
export {
    ProductCommand as Command,
    ProductCommandDialog as CommandDialog,
    ProductCommandInput as CommandInput,
    ProductCommandList as CommandList,
    ProductCommandEmpty as CommandEmpty,
    ProductCommandGroup as CommandGroup,
    ProductCommandItem as CommandItem,
    ProductCommandShortcut as CommandShortcut,
    ProductCommandSeparator as CommandSeparator,
};
