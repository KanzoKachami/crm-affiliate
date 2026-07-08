"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getWeekDays(reference: Date) {
  const dayIndex = (reference.getDay() + 6) % 7; // 0 = понедельник
  const monday = new Date(reference);
  monday.setDate(reference.getDate() - dayIndex);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function CalendarWidget({ tasks }: { tasks: Task[] }) {
  const today = new Date();
  const week = getWeekDays(today);
  const [selected, setSelected] = useState<Date>(today);

  const tasksByDay = (day: Date) => tasks.filter((t) => isSameDay(new Date(t.deadline), day));

  const selectedTasks = tasksByDay(selected);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Календарь</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-7 gap-1.5">
          {week.map((day, i) => {
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selected);
            const dayTasks = tasksByDay(day);

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(day)}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="text-[11px] text-fog font-mono">{WEEKDAYS_SHORT[i]}</span>
                <div
                  className={cn(
                    "relative h-8 w-8 flex items-center justify-center rounded-md text-sm font-mono transition-colors",
                    isSelected
                      ? "bg-signal text-ink font-medium"
                      : isToday
                      ? "bg-panel-raised text-signal border border-signal-dim font-medium"
                      : "text-paper bg-panel-raised/60 hover:bg-panel-raised"
                  )}
                >
                  {day.getDate()}
                  {dayTasks.length > 0 && !isSelected && (
                    <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-ember" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-line">
          <p className="text-xs text-fog font-mono uppercase tracking-wide mb-2">
            {selected.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })}
            {isSameDay(selected, today) && " · сегодня"}
          </p>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-fog">Задач с дедлайном на этот день нет.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {selectedTasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/partners/${task.partnerId}` as any}
                    className="block rounded-md px-2 py-1.5 -mx-2 hover:bg-panel-raised transition-colors"
                  >
                    <p className="text-sm text-paper leading-snug">{task.title}</p>
                    <p className="text-xs text-fog">{task.partnerName}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
