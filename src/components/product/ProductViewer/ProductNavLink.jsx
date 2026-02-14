import { NavLink as RouterNavLink } from "react-router-dom"
import { forwardRef } from "react"
import { cn } from "../../../lib/utils"

const ProductNavLink = forwardRef(
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
    )
  }
)

ProductNavLink.displayName = "ProductNavLink"

export { ProductNavLink, ProductNavLink as NavLink }
