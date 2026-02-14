import { useToast } from "../../hooks/use-toast";
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "./ProductToast";

export function ProductToaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                return (
                    <Toast key={id} {...props}>
                        <div className="grid gap-1.5">
                            {title && (
                                <ToastTitle className="text-sm font-semibold tracking-tight">
                                    {title}
                                </ToastTitle>
                            )}
                            {description && (
                                <ToastDescription className="text-xs leading-relaxed opacity-80">
                                    {description}
                                </ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport className="sm:bottom-4 sm:right-4 gap-3" />
        </ToastProvider>
    );
}

export { ProductToaster as Toaster };
