import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "../../lib/utils";

const ProductInputOTP = React.forwardRef<
    React.ElementRef<typeof OTPInput>,
    React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
    <OTPInput
        ref={ref}
        containerClassName={cn(
            "flex items-center gap-2 has-[:disabled]:opacity-50",
            containerClassName
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
    />
));
ProductInputOTP.displayName = "ProductInputOTP";

const ProductInputOTPGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
ProductInputOTPGroup.displayName = "ProductInputOTPGroup";

const ProductInputOTPSlot = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { index: number }
>(({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex h-12 w-12 items-center justify-center border-y border-r border-border/50 bg-background text-sm transition-all first:rounded-xl first:border-l last:rounded-xl",
                isActive && "z-10 ring-2 ring-accent ring-offset-background",
                className,
            )}
            {...props}
        >
            <span className="font-mono text-lg font-medium">{char}</span>
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-caret-blink h-5 w-px bg-accent duration-1000" />
                </div>
            )}
        </div>
    );
});
ProductInputOTPSlot.displayName = "ProductInputOTPSlot";

const ProductInputOTPSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
        <Dot className="text-muted-foreground/50" />
    </div>
));
ProductInputOTPSeparator.displayName = "ProductInputOTPSeparator";

export {
    ProductInputOTP,
    ProductInputOTPGroup,
    ProductInputOTPSlot,
    ProductInputOTPSeparator,
};
export {
    ProductInputOTP as InputOTP,
    ProductInputOTPGroup as InputOTPGroup,
    ProductInputOTPSlot as InputOTPSlot,
    ProductInputOTPSeparator as InputOTPSeparator,
};
