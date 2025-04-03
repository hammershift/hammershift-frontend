import { cn } from '@/helpers/utils'
import { forwardRef } from 'react'

interface TextAreaProps {
  className?: string
  id?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  rows?: number
}


const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  className,
  id,
  name,
  value,
  onChange,
  required,
  rows,
  ...props
}, ref) => {
  return (
    (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        {...props} />
    )
  );
})
TextArea.displayName = "TextArea"

export { TextArea }
