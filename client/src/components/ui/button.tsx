import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-[var(--background-tertiary)] bg-transparent hover:bg-[var(--background-secondary)] text-[var(--text-normal)]",
        secondary: "bg-[var(--background-secondary)] text-[var(--text-normal)] hover:bg-[var(--background-tertiary)]",
        ghost: "hover:bg-[var(--background-secondary)] hover:text-[var(--text-normal)]",
        link: "text-[var(--text-link)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 py-1",
        lg: "h-11 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 