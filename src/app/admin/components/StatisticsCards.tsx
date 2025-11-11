export interface StatisticsData {
  measuring: number;
  todayCompleted: number;
  todayScheduled: number;
}

interface StatisticsCardsProps {
  data: StatisticsData;
}

export default function StatisticsCards({ data }: StatisticsCardsProps) {
  const cards = [
    { label: '측정 중', value: data.measuring, color: 'text-blue-600' },
    { label: '오늘 측정 완료', value: data.todayCompleted, color: 'text-blue-600' },
    { label: '오늘 측정 예정', value: data.todayScheduled, color: 'text-blue-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-6 text-center"
        >
          <div className={`text-4xl font-bold mb-2 ${card.color}`}>
            {card.value}
          </div>
          <div className="text-gray-600 text-sm">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
