import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "../../lib/utils";

const ProductMenubarMenu = MenubarPrimitive.Menu;
const ProductMenubarGroup = MenubarPrimitive.Group;
const ProductMenubarPortal = MenubarPrimitive.Portal;
const ProductMenubarSub = MenubarPrimitive.Sub;
const ProductMenubarRadioGroup = MenubarPrimitive.RadioGroup;

const ProductMenubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-11 items-center space-x-1 rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm p-1 shadow-sm",
      className
    )}
    {...props}
  />
));
ProductMenubar.displayName = "ProductMenubar";

const ProductMenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      className
    )}
    {...props}
  />
));
ProductMenubarTrigger.displayName = "ProductMenubarTrigger";

const ProductMenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
  </MenubarPrimitive.SubTrigger>
));
ProductMenubarSubTrigger.displayName = "ProductMenubarSubTrigger";

const ProductMenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      className
    )}
    {...props}
  />
));
ProductMenubarSubContent.displayName = "ProductMenubarSubContent";

const ProductMenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border/50 bg-popover/95 backdrop-blur-md p-1 text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    />
  </MenubarPrimitive.Portal>
));
ProductMenubarContent.displayName = "ProductMenubarContent";

const ProductMenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
ProductMenubarItem.displayName = "ProductMenubarItem";

const ProductMenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="h-4 w-4 stroke-[3px]" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
ProductMenubarCheckboxItem.displayName = "ProductMenubarCheckboxItem";

const ProductMenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
ProductMenubarRadioItem.displayName = "ProductMenubarRadioItem";

const ProductMenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-display font-semibold uppercase tracking-widest text-muted-foreground/70",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
ProductMenubarLabel.displayName = "ProductMenubarLabel";

const ProductMenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-border/50", className)}
    {...props}
  />
));
ProductMenubarSeparator.displayName = "ProductMenubarSeparator";

const ProductMenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-[10px] tracking-widest text-muted-foreground opacity-50",
        className
      )}
      {...props}
    />
  );
};
ProductMenubarShortcut.displayName = "ProductMenubarShortcut";

export {
  ProductMenubar,
  ProductMenubarMenu,
  ProductMenubarTrigger,
  ProductMenubarContent,
  ProductMenubarItem,
  ProductMenubarSeparator,
  ProductMenubarLabel,
  ProductMenubarCheckboxItem,
  ProductMenubarRadioGroup,
  ProductMenubarRadioItem,
  ProductMenubarPortal,
  ProductMenubarSubContent,
  ProductMenubarSubTrigger,
  ProductMenubarGroup,
  ProductMenubarSub,
  ProductMenubarShortcut,
};
export {
  ProductMenubar as Menubar,
  ProductMenubarMenu as MenubarMenu,
  ProductMenubarTrigger as MenubarTrigger,
  ProductMenubarContent as MenubarContent,
  ProductMenubarItem as MenubarItem,
  ProductMenubarSeparator as MenubarSeparator,
  ProductMenubarLabel as MenubarLabel,
  ProductMenubarCheckboxItem as MenubarCheckboxItem,
  ProductMenubarRadioGroup as MenubarRadioGroup,
  ProductMenubarRadioItem as MenubarRadioItem,
  ProductMenubarPortal as MenubarPortal,
  ProductMenubarSubContent as MenubarSubContent,
  ProductMenubarSubTrigger as MenubarSubTrigger,
  ProductMenubarGroup as MenubarGroup,
  ProductMenubarSub as MenubarSub,
  ProductMenubarShortcut as MenubarShortcut,
};
