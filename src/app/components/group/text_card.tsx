import { cn } from '@/helpers/utils'
import { forwardRef } from 'react'

interface CardProps {
  className?: string
  children?: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}
    {...props}
  >
    {children}
  </div>
))

Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    {children}
  </div>
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </div>
))
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </div>
))
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}
  >
    {children}
  </div>
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<HTMLDivElement, CardProps>(({
  className,
  children,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  >
    {children}
  </div>
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
