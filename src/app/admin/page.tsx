'use client';

import TabNavigation, { Tab } from './components/TabNavigation';
import StatisticsCards, { StatisticsData } from './components/StatisticsCards';
import Calendar, { CalendarEvent } from './components/Calendar';
import MeasurementWaitingTable, {
  MeasurementData,
} from './components/MeasurementWaitingTable';
import SchoolStatistics, { SchoolStat } from './components/SchoolStatistics';

// Dummy data for tabs
const tabs: Tab[] = [
  { id: 'smart-uniform', label: '스마트학생복 정주점' },
  { id: 'seungchang', label: '승창' },
  { id: 'reservation', label: '예약수당' },
  { id: 'order', label: '주문등록' },
];

// Dummy data for statistics
const statisticsData: StatisticsData = {
  measuring: 0,
  todayCompleted: 0,
  todayScheduled: 0,
};

// Dummy data for calendar events
const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '중학교측정 1/4',
    startDate: new Date(2026, 0, 4),
    endDate: new Date(2026, 0, 4),
    color: '#10B981',
    type: 'middle',
  },
  {
    id: '2',
    title: '출발중학교 -1/11',
    startDate: new Date(2026, 0, 8),
    endDate: new Date(2026, 0, 10),
    color: '#059669',
    type: 'middle',
  },
  {
    id: '3',
    title: '출발중학...',
    startDate: new Date(2026, 0, 11),
    endDate: new Date(2026, 0, 11),
    color: '#10B981',
    type: 'middle',
  },
  {
    id: '4',
    title: '교복판매 1차',
    startDate: new Date(2026, 0, 14),
    endDate: new Date(2026, 0, 14),
    color: '#FBBF24',
    type: 'sale',
  },
  {
    id: '5',
    title: '청주고등학교 -1/15',
    startDate: new Date(2026, 0, 15),
    endDate: new Date(2026, 0, 17),
    color: '#DC2626',
    type: 'high',
  },
  {
    id: '6',
    title: '청주고등학교 -1/15',
    startDate: new Date(2026, 0, 18),
    endDate: new Date(2026, 0, 23),
    color: '#B91C1C',
    type: 'high',
  },
];

// Dummy data for measurement waiting table
const measurementData: MeasurementData[] = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  completedAt: '25/01/12 15:00',
  studentName: '김인철',
  gender: '남',
  school: '청주고등학교',
  category: '신입',
  expectedAmount: '112,335원',
}));

// Dummy data for school statistics
const middleSchools: SchoolStat[] = [
  {
    name: '송림중학교',
    period: '-1/15',
    count: '[255/225]',
    color: '#10B981',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#7C3AED',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#7C3AED',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#7C3AED',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#7C3AED',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#7C3AED',
  },
];

const highSchools: SchoolStat[] = [
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#DC2626',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[0/225]',
    color: '#DC2626',
  },
  {
    name: '청주고등학교',
    period: '-1/15',
    count: '[224/225]',
    color: '#DC2626',
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <TabNavigation tabs={tabs} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <StatisticsCards data={statisticsData} />

        {/* Calendar */}
        <Calendar events={calendarEvents} year={2026} month={1} />

        {/* Measurement Waiting Table */}
        <MeasurementWaitingTable data={measurementData} />

        {/* School Statistics */}
        <SchoolStatistics
          middleSchools={middleSchools}
          highSchools={highSchools}
        />
      </div>
    </div>
  );
}
