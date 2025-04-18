import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from '@/helpers/utils'

const Accordion = AccordionPrimitive.Root

interface IProps {
  className?: string;
  children?: React.ReactNode;
  [x: string]: any;
}

const AccordionItem = React.forwardRef<HTMLDivElement, IProps>(({
  className,
  children,
  value,
  ...props
}, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} value={value!} {...props}
  >
    {children}
  </AccordionPrimitive.Item>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<HTMLButtonElement, IProps>(({
  className,
  children,
  ...props
}, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}>
      {children}
      <ChevronDown
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<HTMLDivElement, IProps>(({
  className,
  children,
  ...props
}, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
