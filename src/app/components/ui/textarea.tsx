import { cn } from '@/helpers/utils'
import React from 'react'

interface TextAreaProps {
  className?: string;
  children?: React.ReactNode;
  [x: string]: any;
}


const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className, children, ...props }, ref) => {
  return (
    (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props} />
    )
  );
})
TextArea.displayName = "TextArea"

export { TextArea }
