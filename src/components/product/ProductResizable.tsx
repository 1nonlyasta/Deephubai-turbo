import * as React from "react";
import { GripVertical } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";

import { cn } from "../../lib/utils";

const ProductResizablePanelGroup = ({
    className,
    ...props
}: React.ComponentProps<typeof Group>) => (
    <Group
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
);

const ProductResizablePanel = Panel;

const ProductResizableHandle = ({
    withHandle,
    className,
    ...props
}: React.ComponentProps<typeof Separator> & {
    withHandle?: boolean;
}) => (
    <Separator
        className={cn(
            "relative flex w-px items-center justify-center bg-border transition-colors hover:bg-accent/50 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-1",
            "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-2 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
            className
        )}
        {...props}
    >
        {withHandle && (
            <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-background shadow-sm transition-colors group-hover:border-accent/50 group-data-[state=drag]:bg-accent group-data-[state=drag]:text-accent-foreground">
                <GripVertical className="h-2.5 w-2.5" />
            </div>
        )}
    </Separator>
);

export {
    ProductResizablePanelGroup,
    ProductResizablePanel,
    ProductResizableHandle,
};
export {
    ProductResizablePanelGroup as ResizablePanelGroup,
    ProductResizablePanel as ResizablePanel,
    ProductResizableHandle as ResizableHandle,
};
