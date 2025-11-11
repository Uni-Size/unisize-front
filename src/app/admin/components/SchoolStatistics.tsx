export interface SchoolStat {
  name: string;
  period: string;
  count: string;
  color: string;
}

interface SchoolStatisticsProps {
  middleSchools: SchoolStat[];
  highSchools: SchoolStat[];
}

export default function SchoolStatistics({
  middleSchools,
  highSchools,
}: SchoolStatisticsProps) {
  const StatList = ({ title, schools }: { title: string; schools: SchoolStat[] }) => (
    <div className="flex-1">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <div className="space-y-2">
        {schools.map((school, index) => (
          <div
            key={index}
            className="flex items-center p-3 rounded"
            style={{ backgroundColor: school.color }}
          >
            <div className="w-3 h-3 rounded-sm bg-current mr-3"></div>
            <span className="text-white">
              {school.name} {school.period} {school.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex gap-8">
        <StatList title="중학교" schools={middleSchools} />
        <StatList title="고등학교" schools={highSchools} />
      </div>
    </div>
  );
}
