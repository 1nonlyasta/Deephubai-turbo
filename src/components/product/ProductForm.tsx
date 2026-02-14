import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    FormProvider,
    useFormContext,
} from "react-hook-form";

import { cn } from "../../lib/utils";
import { ProductLabel } from "./ProductLabel";

const ProductForm = FormProvider;

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

const ProductFormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(ProductFormItemContext); // Changed from FormItemContext
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};

type FormItemContextValue = {
    id: string;
};

const ProductFormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
);

const ProductFormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const id = React.useId();

    return (
        <ProductFormItemContext.Provider value={{ id }}>
            <div ref={ref} className={cn("space-y-2", className)} {...props} />
        </ProductFormItemContext.Provider>
    );
});
ProductFormItem.displayName = "ProductFormItem";

const ProductFormLabel = React.forwardRef<
    React.ElementRef<typeof ProductLabel>,
    React.ComponentPropsWithoutRef<typeof ProductLabel>
>(({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return (
        <ProductLabel
            ref={ref}
            className={cn(error && "text-destructive", className)}
            htmlFor={formItemId}
            {...props}
        />
    );
});
ProductFormLabel.displayName = "ProductFormLabel";

const ProductFormControl = React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

    return (
        <Slot
            ref={ref}
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
});
ProductFormControl.displayName = "ProductFormControl";

const ProductFormDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
        <p
            ref={ref}
            id={formDescriptionId}
            className={cn("text-[13px] text-muted-foreground/70 font-light", className)}
            {...props}
        />
    );
});
ProductFormDescription.displayName = "ProductFormDescription";

const ProductFormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) {
        return null;
    }

    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-[13px] font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1", className)}
            {...props}
        >
            {body}
        </p>
    );
});
ProductFormMessage.displayName = "ProductFormMessage";

export {
    useFormField,
    ProductForm,
    ProductFormItem,
    ProductFormLabel,
    ProductFormControl,
    ProductFormDescription,
    ProductFormMessage,
    ProductFormField,
};
export {
    ProductForm as Form,
    ProductFormItem as FormItem,
    ProductFormLabel as FormLabel,
    ProductFormControl as FormControl,
    ProductFormDescription as FormDescription,
    ProductFormMessage as FormMessage,
    ProductFormField as FormField,
};
