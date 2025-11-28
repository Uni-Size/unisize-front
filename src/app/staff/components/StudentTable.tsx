import { RegisterStudent } from "@/api/studentApi";

interface StudentTableProps {
  students: RegisterStudent[];
  total: number;
  isLoading: boolean;
  error: string | null;
  isFetchingMore: boolean;
  lastElementRef: (node: HTMLTableRowElement | null) => void;
  onDetailClick: (student: RegisterStudent) => void;
}

export default function StudentTable({
  students,
  total,
  isLoading,
  error,
  isFetchingMore,
  lastElementRef,
  onDetailClick,
}: StudentTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className="text-sm text-gray-600 pt-4 pb-2">총 {total}명 대기중</div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center py-12">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {!isLoading && !error && students.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">대기 중인 학생이 없습니다.</div>
        </div>
      )}

      {!isLoading && !error && students.length > 0 && (
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                No.
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center gap-1">접수시간</div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center gap-1">학생이름</div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                성별
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[280px]">
                출신학교 → 입학학교
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                분류
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                상세
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((row, index) => (
              <tr
                key={row.id}
                ref={index === students.length - 1 ? lastElementRef : null}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.checked_in_at}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.gender === "M" ? "남" : "여"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.previous_school} → {row.school_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.grade === 1 ? "신입" : "재학"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={() => onDetailClick(row)}
                  >
                    ↗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isFetchingMore && (
        <div className="flex justify-center items-center py-6">
          <div className="text-gray-500">더 많은 데이터를 불러오는 중...</div>
        </div>
      )}
    </div>
  );
}
