import * as React from "react";
import { NavLink as RouterNavLink, NavLinkProps as RouterNavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "../lib/utils";

interface NavLinkProps extends Omit<RouterNavLinkProps, 'className'> {
    className?: string;
    activeClassName?: string;
    pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
        return (
            <RouterNavLink
                ref={ref}
                to={to}
                className={({ isActive, isPending }) =>
                    cn(
                        className,
                        isActive && activeClassName,
                        isPending && pendingClassName
                    )
                }
                {...props}
            />
        );
    }
);

NavLink.displayName = "NavLink";

export { NavLink };
