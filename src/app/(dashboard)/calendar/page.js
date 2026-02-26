"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isToday,
  parseISO,
} from "date-fns";
import axios from "axios";
import { clsx } from "clsx";
import Link from "next/link";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trackrs, setTrackrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackrs();
  }, []);

  const fetchTrackrs = async () => {
    try {
      const res = await axios.get("/api/trackrs");
      if (res.data.success) {
        setTrackrs(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch trackrs", error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2.5 rounded-xl shadow-lg shadow-black/10">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </h1>
            <p className="text-gray-500 font-medium">
              Keep track of your deadlines
            </p>
          </div>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl shadow-sm p-1.5">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-black"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="h-4 w-px bg-gray-200 mx-2" />
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors"
          >
            Today
          </button>
          <div className="h-4 w-px bg-gray-200 mx-2" />
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600 hover:text-black"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-xl">
        {calendarDays.map((day, idx) => {
          const formattedDate = format(day, "d");
          const dayTasks = trackrs.filter((t) => {
            if (!t.dueDate) return false;
            // Parse and normalize to compare just the date part
            const taskDate = new Date(t.dueDate);
            return (
              taskDate.getFullYear() === day.getFullYear() &&
              taskDate.getMonth() === day.getMonth() &&
              taskDate.getDate() === day.getDate()
            );
          });

          return (
            <div
              key={idx}
              className={clsx(
                "min-h-[140px] bg-white p-3 transition-all relative group",
                !isSameMonth(day, monthStart) && "bg-gray-50/50",
                isToday(day) && "ring-2 ring-inset ring-black z-10",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={clsx(
                    "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                    isToday(day)
                      ? "bg-black text-white"
                      : !isSameMonth(day, monthStart)
                        ? "text-gray-300"
                        : "text-gray-500 group-hover:text-black",
                  )}
                >
                  {formattedDate}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                    {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 overflow-hidden">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id}
                    className={clsx(
                      "text-[11px] px-2 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all truncate",
                      task.completed
                        ? "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
                        : "bg-white border-gray-200 text-gray-700 shadow-sm hover:shadow-md hover:border-gray-300",
                    )}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                    )}
                    <span className="truncate leading-tight font-medium">
                      {task.title}
                    </span>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] font-bold text-gray-400 pl-2">
                    + {dayTasks.length - 3} more
                  </div>
                )}
              </div>

              {/* Quick Hover Add Button */}
              <Link
                href="/todos"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black p-1.5 rounded-lg text-white shadow-lg shadow-black/20"
              >
                <Plus className="h-3 w-3" />
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {renderHeader()}
      <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-2xl">
        {renderDays()}
        {renderCells()}
      </div>

      {/* Legend / Stats */}
      <div className="mt-8 flex gap-6 items-center px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <div className="h-2 w-2 rounded-full bg-black" />
          Pending
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium opacity-60">
          <CheckCircle2 className="h-4 w-4" />
          Completed
        </div>
        <div className="h-4 w-px bg-gray-200 mx-2" />
        <p className="text-sm text-gray-400">
          Tip: Click on a task to manage it in your Todo list.
        </p>
      </div>
    </div>
  );
}
