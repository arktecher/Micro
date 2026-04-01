import * as React from "react";

import { cn } from "./utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none flex field-sizing-content min-h-16 w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm sm:text-base text-foreground shadow-none",
        "placeholder:text-muted-foreground transition-[color,box-shadow,background-color,border-color] outline-none",
        "focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0 focus-visible:ring-offset-0",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-input dark:bg-input/30 dark:focus-visible:border-primary dark:focus-visible:bg-background",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };

