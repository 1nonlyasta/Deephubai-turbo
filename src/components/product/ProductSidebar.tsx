import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "../../hooks/use-mobile"
import { cn } from "../../lib/utils"
import { ProductButton } from "../../components/product/ProductButton"
import { ProductInput } from "../../components/product/ProductInput"
import { ProductSeparator } from "../../components/product/ProductSeparator"
import { ProductSheet, ProductSheetContent } from "../../components/product/ProductSheet"
import { ProductSkeleton } from "../../components/product/ProductSkeleton"
import {
    ProductTooltip,
    ProductTooltipContent,
    ProductTooltipProvider,
    ProductTooltipTrigger
} from "../../components/product/ProductTooltip"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
    state: "expanded" | "collapsed"
    open: boolean
    setOpen: (open: boolean | ((open: boolean) => boolean)) => void
    openMobile: boolean
    setOpenMobile: (open: boolean) => void
    isMobile: boolean
    toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
    const context = React.useContext(SidebarContext)
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.")
    }

    return context
}

const ProductSidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        defaultOpen?: boolean
        open?: boolean
        onOpenChange?: (open: boolean) => void
    }
>(
    (
        {
            defaultOpen = true,
            open: openProp,
            onOpenChange: setOpenProp,
            className,
            style,
            children,
            ...props
        },
        ref
    ) => {
        const isMobile = useIsMobile()
        const [openMobile, setOpenMobile] = React.useState(false)

        // This is the internal state of the sidebar.
        // We use openProp and setOpenProp for control from outside the component.
        const [_open, _setOpen] = React.useState(defaultOpen)
        const open = openProp ?? _open
        const setOpen = React.useCallback(
            (value: boolean | ((open: boolean) => boolean)) => {
                const openState = typeof value === "function" ? value(open) : value
                if (setOpenProp) {
                    setOpenProp(openState)
                } else {
                    _setOpen(openState)
                }

                // This sets the cookie to keep the sidebar state.
                document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
            },
            [setOpenProp, open]
        )

        // Helper to toggle the sidebar.
        const toggleSidebar = React.useCallback(() => {
            return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open)
        }, [isMobile, setOpen, setOpenMobile])

        // Adds a keyboard shortcut to toggle the sidebar.
        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (
                    event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                    (event.metaKey || event.ctrlKey)
                ) {
                    event.preventDefault()
                    toggleSidebar()
                }
            }

            window.addEventListener("keydown", handleKeyDown)
            return () => window.removeEventListener("keydown", handleKeyDown)
        }, [toggleSidebar])

        // We add a state so that we can do data-state="expanded" or "collapsed".
        // This makes it easier to style the sidebar with Tailwind classes.
        const state = open ? "expanded" : "collapsed"

        const contextValue = React.useMemo<SidebarContext>(
            () => ({
                state,
                open,
                setOpen,
                isMobile: !!isMobile,
                openMobile,
                setOpenMobile,
                toggleSidebar
            }),
            [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
        )

        return (
            <SidebarContext.Provider value={contextValue}>
                <ProductTooltipProvider delayDuration={0}>
                    <div
                        style={{
                            "--sidebar-width": SIDEBAR_WIDTH,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            ...style
                        } as React.CSSProperties}
                        className={cn(
                            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {children}
                    </div>
                </ProductTooltipProvider>
            </SidebarContext.Provider>
        )
    }
)
ProductSidebarProvider.displayName = "ProductSidebarProvider"

const ProductSidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        side?: "left" | "right"
        variant?: "sidebar" | "floating" | "inset"
        collapsible?: "offcanvas" | "icon" | "none"
    }
>(
    (
        {
            side = "left",
            variant = "sidebar",
            collapsible = "offcanvas",
            className,
            children,
            ...props
        },
        ref
    ) => {
        const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

        if (collapsible === "none") {
            return (
                <div
                    className={cn(
                        "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            )
        }

        if (isMobile) {
            return (
                <ProductSheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                    <ProductSheetContent
                        data-sidebar="sidebar"
                        data-mobile="true"
                        className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                        style={{
                            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
                        } as React.CSSProperties}
                        side={side}
                    >
                        <div className="flex h-full w-full flex-col">{children}</div>
                    </ProductSheetContent>
                </ProductSheet>
            )
        }

        return (
            <div
                ref={ref}
                className="group peer hidden text-sidebar-foreground md:block"
                data-state={state}
                data-collapsible={state === "collapsed" ? collapsible : ""}
                data-variant={variant}
                data-side={side}
            >
                {/* This is what handles the sidebar gap on desktop */}
                <div
                    className={cn(
                        "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
                        "group-data-[collapsible=offcanvas]:w-0",
                        "group-data-[side=right]:rotate-180",
                        variant === "floating" || variant === "inset"
                            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
                            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
                    )}
                />
                <div
                    className={cn(
                        "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
                        side === "left"
                            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
                            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
                        // Adjust the padding for floating and inset variants.
                        variant === "floating" || variant === "inset"
                            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
                            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
                        className
                    )}
                    {...props}
                >
                    <div
                        data-sidebar="sidebar"
                        className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
                    >
                        {children}
                    </div>
                </div>
            </div>
        )
    }
)
ProductSidebar.displayName = "ProductSidebar"

const ProductSidebarTrigger = React.forwardRef<
    React.ElementRef<typeof ProductButton>,
    React.ComponentPropsWithoutRef<typeof ProductButton>
>(({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
        <ProductButton
            ref={ref}
            data-sidebar="trigger"
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", className)}
            onClick={event => {
                onClick?.(event)
                toggleSidebar()
            }}
            {...props}
        >
            <PanelLeft />
            <span className="sr-only">Toggle Sidebar</span>
        </ProductButton>
    )
})
ProductSidebarTrigger.displayName = "ProductSidebarTrigger"

const ProductSidebarRail = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
        <button
            ref={ref}
            data-sidebar="rail"
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className={cn(
                "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex",
                "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
                "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
                "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
                "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
                "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarRail.displayName = "ProductSidebarRail"

const ProductSidebarInset = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
    return (
        <main
            ref={ref}
            className={cn(
                "relative flex min-h-svh flex-1 flex-col bg-background",
                "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarInset.displayName = "ProductSidebarInset"

const ProductSidebarInput = React.forwardRef<
    React.ElementRef<typeof ProductInput>,
    React.ComponentPropsWithoutRef<typeof ProductInput>
>(({ className, ...props }, ref) => {
    return (
        <ProductInput
            ref={ref}
            data-sidebar="input"
            className={cn(
                "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarInput.displayName = "ProductSidebarInput"

const ProductSidebarHeader = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="header"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    )
})
ProductSidebarHeader.displayName = "ProductSidebarHeader"

const ProductSidebarFooter = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="footer"
            className={cn("flex flex-col gap-2 p-2", className)}
            {...props}
        />
    )
})
ProductSidebarFooter.displayName = "ProductSidebarFooter"

const ProductSidebarSeparator = React.forwardRef<
    React.ElementRef<typeof ProductSeparator>,
    React.ComponentPropsWithoutRef<typeof ProductSeparator>
>(({ className, ...props }, ref) => {
    return (
        <ProductSeparator
            ref={ref}
            data-sidebar="separator"
            className={cn("mx-2 w-auto bg-sidebar-border", className)}
            {...props}
        />
    )
})
ProductSidebarSeparator.displayName = "ProductSidebarSeparator"

const ProductSidebarContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="content"
            className={cn(
                "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarContent.displayName = "ProductSidebarContent"

const ProductSidebarGroup = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="group"
            className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
            {...props}
        />
    )
})
ProductSidebarGroup.displayName = "ProductSidebarGroup"

const ProductSidebarGroupLabel = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div"

    return (
        <Comp
            ref={ref}
            data-sidebar="group-label"
            className={cn(
                "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarGroupLabel.displayName = "ProductSidebarGroupLabel"

const ProductSidebarGroupAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            ref={ref}
            data-sidebar="group-action"
            className={cn(
                "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 after:md:hidden",
                "group-data-[collapsible=icon]:hidden",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarGroupAction.displayName = "ProductSidebarGroupAction"

const ProductSidebarGroupContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="group-content"
        className={cn("w-full text-sm", className)}
        {...props}
    />
))
ProductSidebarGroupContent.displayName = "ProductSidebarGroupContent"

const ProductSidebarMenu = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu"
        className={cn("flex w-full min-w-0 flex-col gap-1", className)}
        {...props}
    />
))
ProductSidebarMenu.displayName = "ProductSidebarMenu"

const ProductSidebarMenuItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-sidebar="menu-item"
        className={cn("group/menu-item relative", className)}
        {...props}
    />
))
ProductSidebarMenuItem.displayName = "ProductSidebarMenuItem"

const productSidebarMenuButtonVariants = cva(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
    {
        variants: {
            variant: {
                default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                outline:
                    "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
            },
            size: {
                default: "h-8 text-sm",
                sm: "h-7 text-xs",
                lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    }
)

const ProductSidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> & {
        asChild?: boolean
        isActive?: boolean
        tooltip?: string | React.ComponentProps<typeof TooltipContent>
    } & VariantProps<typeof productSidebarMenuButtonVariants>
>(
    (
        {
            asChild = false,
            isActive = false,
            variant = "default",
            size = "default",
            tooltip,
            className,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button"
        const { isMobile, state } = useSidebar()

        const button = (
            <Comp
                ref={ref}
                data-sidebar="menu-button"
                data-size={size}
                data-active={isActive}
                className={cn(productSidebarMenuButtonVariants({ variant, size }), className)}
                {...props}
            />
        )

        if (!tooltip) {
            return button
        }

        if (typeof tooltip === "string") {
            tooltip = {
                children: tooltip
            }
        }

        return (
            <ProductTooltip>
                <ProductTooltipTrigger asChild>{button}</ProductTooltipTrigger>
                <ProductTooltipContent
                    side="right"
                    align="center"
                    hidden={state !== "collapsed" || isMobile}
                    {...tooltip}
                />
            </ProductTooltip>
        )
    }
)
ProductSidebarMenuButton.displayName = "ProductSidebarMenuButton"

const ProductSidebarMenuAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> & {
        asChild?: boolean
        showOnHover?: boolean
    }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-action"
            className={cn(
                "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
                // Increases the hit area of the button on mobile.
                "after:absolute after:-inset-2 after:md:hidden",
                "peer-data-[size=sm]/menu-button:top-1",
                "peer-data-[size=default]/menu-button:top-1.5",
                "peer-data-[size=lg]/menu-button:top-2.5",
                "group-data-[collapsible=icon]:hidden",
                showOnHover &&
                "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
                className
            )}
            {...props}
        />
    )
})
ProductSidebarMenuAction.displayName = "ProductSidebarMenuAction"

const ProductSidebarMenuBadge = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
            "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
            "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
            "peer-data-[size=sm]/menu-button:top-1",
            "peer-data-[size=default]/menu-button:top-1.5",
            "peer-data-[size=lg]/menu-button:top-2.5",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
))
ProductSidebarMenuBadge.displayName = "ProductSidebarMenuBadge"

const ProductSidebarMenuSkeleton = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & { showIcon?: boolean }
>(
    ({ className, showIcon = false, ...props }, ref) => {
        // Random width between 50 to 90%.
        const width = React.useMemo(() => {
            return `${Math.floor(Math.random() * 40) + 50}%`
        }, [])

        return (
            <div
                ref={ref}
                data-sidebar="menu-skeleton"
                className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
                {...props}
            >
                {showIcon && (
                    <ProductSkeleton
                        className="size-4 rounded-md"
                        data-sidebar="menu-skeleton-icon"
                    />
                )}
                <ProductSkeleton
                    className="h-4 max-w-[--skeleton-width] flex-1"
                    data-sidebar="menu-skeleton-text"
                    style={{
                        "--skeleton-width": width
                    } as React.CSSProperties}
                />
            </div>
        )
    }
)
ProductSidebarMenuSkeleton.displayName = "ProductSidebarMenuSkeleton"

const ProductSidebarMenuSub = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu-sub"
        className={cn(
            "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
            "group-data-[collapsible=icon]:hidden",
            className
        )}
        {...props}
    />
))
ProductSidebarMenuSub.displayName = "ProductSidebarMenuSub"

const ProductSidebarMenuSubItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<"li">
>(({ ...props }, ref) => (
    <li ref={ref} {...props} />
))
ProductSidebarMenuSubItem.displayName = "ProductSidebarMenuSubItem"

const ProductSidebarMenuSubButton = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<"a"> & {
        asChild?: boolean
        size?: "sm" | "md"
        isActive?: boolean
    }
>(
    ({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
        const Comp = asChild ? Slot : "a"

        return (
            <Comp
                ref={ref}
                data-sidebar="menu-sub-button"
                data-size={size}
                data-active={isActive}
                className={cn(
                    "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
                    "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
                    size === "sm" && "text-xs",
                    size === "md" && "text-sm",
                    "group-data-[collapsible=icon]:hidden",
                    className
                )}
                {...props}
            />
        )
    }
)
ProductSidebarMenuSubButton.displayName = "ProductSidebarMenuSubButton"

export {
    ProductSidebar,
    ProductSidebarContent,
    ProductSidebarFooter,
    ProductSidebarGroup,
    ProductSidebarGroupAction,
    ProductSidebarGroupContent,
    ProductSidebarGroupLabel,
    ProductSidebarHeader,
    ProductSidebarInput,
    ProductSidebarInset,
    ProductSidebarMenu,
    ProductSidebarMenuAction,
    ProductSidebarMenuBadge,
    ProductSidebarMenuButton,
    ProductSidebarMenuItem,
    ProductSidebarMenuSkeleton,
    ProductSidebarMenuSub,
    ProductSidebarMenuSubButton,
    ProductSidebarMenuSubItem,
    ProductSidebarProvider,
    ProductSidebarRail,
    ProductSidebarSeparator,
    ProductSidebarTrigger,
    useSidebar
}
export {
    ProductSidebar as Sidebar,
    ProductSidebarContent as SidebarContent,
    ProductSidebarFooter as SidebarFooter,
    ProductSidebarGroup as SidebarGroup,
    ProductSidebarGroupAction as SidebarGroupAction,
    ProductSidebarGroupContent as SidebarGroupContent,
    ProductSidebarGroupLabel as SidebarGroupLabel,
    ProductSidebarHeader as SidebarHeader,
    ProductSidebarInput as SidebarInput,
    ProductSidebarInset as SidebarInset,
    ProductSidebarMenu as SidebarMenu,
    ProductSidebarMenuAction as SidebarMenuAction,
    ProductSidebarMenuBadge as SidebarMenuBadge,
    ProductSidebarMenuButton as SidebarMenuButton,
    ProductSidebarMenuItem as SidebarMenuItem,
    ProductSidebarMenuSkeleton as SidebarMenuSkeleton,
    ProductSidebarMenuSub as SidebarMenuSub,
    ProductSidebarMenuSubButton as SidebarMenuSubButton,
    ProductSidebarMenuSubItem as SidebarMenuSubItem,
    ProductSidebarProvider as SidebarProvider,
    ProductSidebarRail as SidebarRail,
    ProductSidebarSeparator as SidebarSeparator,
    ProductSidebarTrigger as SidebarTrigger,
}
