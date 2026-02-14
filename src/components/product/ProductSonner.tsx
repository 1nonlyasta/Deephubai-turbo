import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const ProductSonner = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:backdrop-blur-md",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton: "group-[.toast]:bg-accent group-[.toast]:text-accent-foreground group-[.toast]:rounded-lg",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
                    // Theming the icon/success colors
                    success: "group-[.toast]:text-accent",
                    error: "group-[.toast]:text-destructive",
                },
            }}
            {...props}
        />
    );
};

export { ProductSonner, ProductSonner as Sonner, toast };
