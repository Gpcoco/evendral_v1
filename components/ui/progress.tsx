'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number;
  className?: string;
}

export function Progress({ className, value = 0 }: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-slate-900/50',
        className
      )}
      value={value}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}