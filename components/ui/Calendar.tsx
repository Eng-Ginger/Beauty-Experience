'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  ...props
}: CalendarProps) {
  const themedClassNames = {
    months: 'relative flex flex-col',
    month: 'w-full',
    month_caption: 'relative mx-8 mb-3 flex h-7 items-center justify-center',
    caption_label: 'text-sm font-bold text-charcoal',
    nav: 'absolute top-0 flex w-full justify-between',
    button_previous:
      'h-7 w-7 flex items-center justify-center rounded-full text-charcoal/60 hover:bg-white hover:text-charcoal transition-colors',
    button_next:
      'h-7 w-7 flex items-center justify-center rounded-full text-charcoal/60 hover:bg-white hover:text-charcoal transition-colors',
    weekdays: 'flex',
    weekday:
      'w-8 h-8 flex items-center justify-center p-0 text-[10px] font-semibold uppercase text-gray-300',
    weeks: 'flex flex-col',
    week: 'flex w-full mt-1',
    day: 'group w-8 h-8 p-0 text-center text-xs relative',
    day_button:
      'relative flex w-8 h-8 items-center justify-center rounded-lg text-xs font-medium text-charcoal transition-colors hover:bg-white group-data-[selected=true]:bg-rose group-data-[selected=true]:text-white group-data-[selected=true]:font-bold group-data-[disabled=true]:text-gray-300 group-data-[disabled=true]:cursor-not-allowed group-data-[disabled=true]:hover:bg-transparent group-data-[outside=true]:text-gray-200',
    today:
      "group-data-today [&>button]:relative [&>button]:after:absolute [&>button]:after:bottom-0.5 [&>button]:after:left-1/2 [&>button]:after:h-1 [&>button]:after:w-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-rose group-data-[selected=true]:[&>button]:after:bg-white",
    outside: 'text-gray-200',
    disabled: 'text-gray-200 cursor-not-allowed',
    hidden: 'invisible',
    ...classNames,
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('w-full', className)}
      classNames={themedClassNames}
      components={{
        Chevron: (chevronProps: any) =>
          chevronProps.orientation === 'left' ? (
            <ChevronLeft size={14} strokeWidth={2.5} />
          ) : (
            <ChevronRight size={14} strokeWidth={2.5} />
          ),
      }}
      {...props}
    />
  )
}
