'use client';

import { useState } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  color: string;
  type?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  year: number;
  month: number;
}

export default function Calendar({ events, year, month }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // Get previous month's last days for padding
  const prevMonthDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    0
  );
  const prevMonthDays = prevMonthDate.getDate();
  const prevMonthPadding = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthDays - startingDayOfWeek + i + 1
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ◀ 이전
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            다음 ▶
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center font-semibold p-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Previous month padding */}
        {prevMonthPadding.map((day, index) => (
          <div key={`prev-${index}`} className="min-h-24 p-2 text-gray-300">
            <div className="text-sm">{day}일</div>
          </div>
        ))}

        {/* Current month days */}
        {days.map((day) => {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dayEvents = getEventsForDate(date);
          const dayOfWeek = date.getDay();

          return (
            <div
              key={day}
              className="min-h-24 p-2 border border-gray-200 hover:bg-gray-50"
            >
              <div
                className={`text-sm mb-1 ${
                  dayOfWeek === 0
                    ? 'text-red-500'
                    : dayOfWeek === 6
                    ? 'text-blue-500'
                    : ''
                }`}
              >
                {day}일
              </div>
              <div className="space-y-1">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded text-white truncate"
                    style={{ backgroundColor: event.color }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
