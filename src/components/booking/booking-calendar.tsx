"use client";

import { DayPicker } from "react-day-picker";
import { pt } from "react-day-picker/locale";

export function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface BookingCalendarProps {
  selected: Date | undefined;
  month: Date;
  onMonthChange: (month: Date) => void;
  onSelect: (date: Date | undefined) => void;
  closedDates: Set<string>;
}

export default function BookingCalendar({ selected, month, onMonthChange, onSelect, closedDates }: BookingCalendarProps) {
  return (
    <DayPicker
      mode="single"
      locale={pt}
      selected={selected}
      month={month}
      onMonthChange={onMonthChange}
      onSelect={onSelect}
      disabled={(day) => formatDateKey(day) < formatDateKey(new Date()) || closedDates.has(formatDateKey(day))}
      classNames={{
        root: "text-sm",
        months: "flex flex-col",
        month_caption: "flex items-center justify-center py-2 font-medium text-foreground",
        nav: "flex items-center justify-between absolute inset-x-0 top-1 px-2",
        button_previous: "size-8 flex items-center justify-center rounded-md hover:bg-secondary text-foreground",
        button_next: "size-8 flex items-center justify-center rounded-md hover:bg-secondary text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-10 text-center text-xs font-medium text-muted-foreground",
        weeks: "",
        week: "flex",
        day: "size-10 text-center p-0.5",
        day_button:
          "size-9 rounded-full text-sm text-foreground hover:bg-secondary disabled:text-muted-foreground/40 disabled:hover:bg-transparent disabled:cursor-not-allowed",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        today: "[&>button]:border [&>button]:border-primary",
        outside: "opacity-40",
      }}
    />
  );
}
