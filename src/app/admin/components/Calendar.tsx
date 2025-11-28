"use client";

import { useState } from "react";

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

interface EventSegment {
  event: CalendarEvent;
  startDay: number;
  endDay: number;
  isStart: boolean;
  isEnd: boolean;
  row: number;
}

export default function Calendar({ events, year, month }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // 날짜를 해당 월의 일(day)로 변환
  const getDateDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (
      d.getFullYear() === currentDate.getFullYear() &&
      d.getMonth() === currentDate.getMonth()
    ) {
      return d.getDate();
    }
    return null;
  };

  // iOS 스타일 이벤트 세그먼트 계산
  const calculateEventSegments = () => {
    const segments: EventSegment[][] = [];
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

    // 주 단위로 이벤트 세그먼트 계산
    let currentDay = 1;

    while (currentDay <= daysInMonth) {
      const weekSegments: EventSegment[] = [];
      const weekStart = currentDay;

      // 주의 마지막 날 계산
      const currentDayOfWeek = (startingDayOfWeek + currentDay - 1) % 7;
      const daysUntilWeekEnd = 6 - currentDayOfWeek;
      const weekEnd = Math.min(currentDay + daysUntilWeekEnd, daysInMonth);

      const weekStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        weekStart
      );
      const weekEndDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        weekEnd
      );
      weekStartDate.setHours(0, 0, 0, 0);
      weekEndDate.setHours(0, 0, 0, 0);

      events.forEach((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        eventStart.setHours(0, 0, 0, 0);
        eventEnd.setHours(0, 0, 0, 0);

        // 이벤트가 이번 주와 겹치는지 확인
        if (eventEnd >= weekStartDate && eventStart <= weekEndDate) {
          // 이벤트의 시작일과 종료일을 이번 달 기준으로 계산
          const eventStartDay = getDateDay(eventStart);
          const eventEndDay = getDateDay(eventEnd);

          // 이 주에서 보여질 세그먼트의 시작과 끝
          const segmentStart = Math.max(
            weekStart,
            eventStartDay !== null ? eventStartDay : 1
          );
          const segmentEnd = Math.min(
            weekEnd,
            eventEndDay !== null ? eventEndDay : daysInMonth
          );

          // 이벤트가 실제로 이번 달에 시작하는지, 끝나는지 확인
          const isEventStartInMonth = eventStartDay !== null;
          const isEventEndInMonth = eventEndDay !== null;

          weekSegments.push({
            event,
            startDay: segmentStart,
            endDay: segmentEnd,
            isStart: isEventStartInMonth && segmentStart === eventStartDay,
            isEnd: isEventEndInMonth && segmentEnd === eventEndDay,
            row: 0,
          });
        }
      });

      // 겹치는 이벤트들의 row 계산 (개선된 로직)
      // 1. 시작일 기준으로 정렬, 같으면 긴 이벤트를 먼저
      weekSegments.sort((a, b) => {
        if (a.startDay !== b.startDay) return a.startDay - b.startDay;
        return b.endDay - b.startDay - (a.endDay - a.startDay);
      });

      // 2. 각 이벤트에 row 할당
      weekSegments.forEach((segment, index) => {
        let row = 0;
        let foundRow = false;

        // 이미 할당된 이벤트들 중에서 겹치지 않는 가장 낮은 row 찾기
        while (!foundRow) {
          let hasConflict = false;

          for (let i = 0; i < index; i++) {
            const other = weekSegments[i];
            // 같은 row에 있고 날짜가 겹치는지 확인
            if (
              other.row === row &&
              segment.startDay <= other.endDay &&
              segment.endDay >= other.startDay
            ) {
              hasConflict = true;
              break;
            }
          }

          if (!hasConflict) {
            foundRow = true;
            segment.row = row;
          } else {
            row++;
          }
        }
      });

      segments.push(weekSegments);
      currentDay = weekEnd + 1;
    }

    return segments;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const eventSegments = calculateEventSegments();

  // 주별로 달력을 렌더링하기 위한 데이터 구조
  const getWeekRows = () => {
    const weeks: number[][] = [];
    let currentWeek: number[] = [];

    // 이전 달 패딩
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(-1);
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // 마지막 주 패딩
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(-1);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = getWeekRows();

  // 특정 날짜의 모든 이벤트 가져오기
  const getEventsForDay = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    date.setHours(0, 0, 0, 0);

    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      return date >= eventStart && date <= eventEnd;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ◀ 이전
          </button>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 rounded"
          >
            다음 ▶
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center font-semibold p-2 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - 주별로 렌더링 */}
      <div className="space-y-0">
        {weeks.map((week, weekIndex) => {
          const weekSegments = eventSegments[weekIndex] || [];
          const maxRow = Math.max(...weekSegments.map((s) => s.row), -1);

          return (
            <div key={weekIndex} className="relative">
              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7">
                {week.map((day, dayIndex) => {
                  if (day === -1) {
                    return (
                      <div
                        key={`empty-${dayIndex}`}
                        className="min-h-24 p-1 border border-gray-200"
                      />
                    );
                  }

                  const date = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  );
                  const dayOfWeek = date.getDay();
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDay === day;

                  return (
                    <div
                      key={day}
                      className="min-h-24 p-1 border border-gray-200  hover:bg-gray-50 relative"
                      style={{ paddingTop: `${(maxRow + 1) * 24 + 4}px` }}
                    >
                      <div
                        className={`text-sm absolute top-1 left-1 cursor-pointer hover:underline ${
                          dayOfWeek === 0
                            ? "text-red-500"
                            : dayOfWeek === 6
                              ? "text-blue-500"
                              : ""
                        }`}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                      >
                        {day}일
                      </div>

                      {/* 날짜 클릭 시 드롭다운 */}
                      {isSelected && dayEvents.length > 0 && (
                        <div className="absolute top-6 left-1 right-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className="text-xs px-2 py-1.5 rounded text-white"
                                style={{ backgroundColor: event.color }}
                              >
                                <div className="font-semibold">
                                  {event.title}
                                </div>
                                <div className="text-[10px] opacity-90">
                                  {new Date(event.startDate).toLocaleDateString(
                                    "ko-KR",
                                    { month: "short", day: "numeric" }
                                  )}{" "}
                                  -{" "}
                                  {new Date(event.endDate).toLocaleDateString(
                                    "ko-KR",
                                    { month: "short", day: "numeric" }
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 이벤트 오버레이 - iOS 스타일 연속된 바 */}
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{ paddingTop: "20px" }}
              >
                {Array.from({ length: maxRow + 1 }).map((_, rowIndex) => {
                  const rowSegments = weekSegments.filter(
                    (s) => s.row === rowIndex
                  );

                  return (
                    <div key={rowIndex} className="relative h-6 mb-0.5">
                      {rowSegments.map((segment) => {
                        const startCol = week.indexOf(segment.startDay);
                        const endCol = week.indexOf(segment.endDay);
                        const span = endCol - startCol + 1;

                        // 셀의 padding을 고려한 정확한 위치 계산
                        const cellWidth = 100 / 7;
                        const leftPos = startCol * cellWidth;
                        const eventWidth = span * cellWidth;

                        // 주의 시작(일요일)에서 시작하는 세그먼트는 텍스트 표시
                        const isWeekStart = startCol === 0;
                        const shouldShowTitle = segment.isStart || isWeekStart;

                        // 하루짜리 이벤트인지 확인
                        const isSingleDay = segment.isStart && segment.isEnd;
                        const displayTitle =
                          isSingleDay && shouldShowTitle
                            ? `${segment.event.title} (${segment.startDay}일)`
                            : shouldShowTitle
                              ? segment.event.title
                              : "";

                        return (
                          <div
                            key={segment.event.id}
                            className="absolute text-xs px-2 py-0.5 text-white truncate pointer-events-auto cursor-pointer transition-all hover:z-[100] hover:overflow-visible hover:whitespace-nowrap hover:shadow-lg hover:min-w-max"
                            style={{
                              backgroundColor: segment.event.color,
                              left: `calc(${leftPos}% + 4px)`,
                              width: `calc(${eventWidth}% - 8px)`,
                              borderRadius:
                                segment.isStart && segment.isEnd
                                  ? "4px"
                                  : segment.isStart
                                    ? "4px 0 0 4px"
                                    : segment.isEnd
                                      ? "0 4px 4px 0"
                                      : "0",
                            }}
                            title={segment.event.title}
                          >
                            {displayTitle}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
