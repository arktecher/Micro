import * as React from "react";
import { cn } from "./utils";
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
    return (<input type={type} data-slot="input" className={cn("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground", "flex h-11 sm:h-12 w-full min-w-0 rounded-md border border-gray-200 bg-gray-100 px-3 py-1 text-sm sm:text-base text-foreground shadow-none", "transition-[color,box-shadow,background-color,border-color] outline-none", "focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0 focus-visible:ring-offset-0", "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium", "dark:border-input dark:bg-input/30 dark:focus-visible:border-primary dark:focus-visible:bg-background", className)} ref={ref} {...props}/>);
});
Input.displayName = "Input";
export { Input };
