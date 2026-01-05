"use client";

import { useEffect, useState } from "react";

interface OrderDetailData {
  order: {
    id: number;
    order_number: string;
    student_id: number;
    total_amount: number;
    status: string;
    order_date: string;
    delivery_date: string | null;
    notes: string | null;
    signature: string | null;
    custom_details: string | null;
  };
  student: {
    id: number;
    name: string;
    school_name: string;
    grade: number;
    class_name: string | null;
    student_number: string | null;
    phone: string | null;
    parent_phone: string | null;
    gender: string | null;
    birth_date: string | null;
    admission_year: number | null;
    admission_grade: number | null;
    delivery: boolean | null;
  } | null;
  measurement: {
    id: number;
    height: number | null;
    weight: number | null;
    shoulder: number | null;
    waist: number | null;
    recommended_size: string | null;
    notes: string | null;
    measured_at: string | null;
    status: string | null;
  } | null;
  order_items: Array<{
    id: number;
    product_id: number;
    product_name: string;
    category: string;
    season: string;
    size: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    customization: string | null;
    delivery_status: string;
  }>;
  payments: Array<{
    id: number;
    amount: number;
    method: string;
    status: string | null;
    transaction_id: string | null;
    payer_name: string | null;
    payer_phone: string | null;
    paid_at: string | null;
  }>;
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  orderId,
}: OrderDetailModalProps) {
  const [data, setData] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/orders/${orderId}`);

      if (!response.ok) {
        throw new Error("주문 상세 정보를 불러오는데 실패했습니다.");
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || "데이터 조회 실패");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">주문 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500">로딩 중...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Smart 헤더 */}
              <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 py-2 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">smart</span>
                  <div className="flex gap-4">
                    <span>판매자</span>
                    <span>기2</span>
                    <span>날짜 1/2</span>
                  </div>
                </div>
              </div>

              {/* 학교 정보 */}
              <div className="border-2 border-gray-300">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-24 border-r border-gray-300">
                        학교
                      </td>
                      <td className="px-3 py-2 border-r border-gray-300">
                        {data.student?.school_name || "-"}
                      </td>
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-32 border-r border-gray-300">
                        {data.student?.admission_grade === 1
                          ? "신입학년"
                          : "입학학교"}
                      </td>
                      <td className="px-3 py-2">
                        {data.student?.grade}학년{" "}
                        {data.student?.class_name || ""}반
                      </td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="px-3 py-2 bg-gray-100 font-semibold border-r border-gray-300">
                        이름
                      </td>
                      <td className="px-3 py-2 border-r border-gray-300">
                        {data.student?.name || "-"}
                      </td>
                      <td className="px-3 py-2 bg-gray-100 font-semibold border-r border-gray-300">
                        입학학교
                      </td>
                      <td className="px-3 py-2">
                        {data.student?.gender === "male"
                          ? "남"
                          : data.student?.gender === "female"
                            ? "여"
                            : "-"}
                        /{data.student?.birth_date ? formatDate(data.student.birth_date) : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 연락처 */}
              <div className="border-2 border-gray-300">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-32 border-r border-gray-300">
                        학생 연락처
                      </td>
                      <td className="px-3 py-2">
                        {data.student?.phone || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 bg-gray-100 font-semibold border-r border-gray-300">
                        보호자 연락처
                      </td>
                      <td className="px-3 py-2">
                        {data.student?.parent_phone || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 측정 정보 */}
              <div className="border-2 border-gray-300">
                <div className="bg-blue-100 px-3 py-2 font-semibold border-b border-gray-300">
                  측정 정보
                </div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-24 border-r border-gray-300">
                        키(cm)
                      </td>
                      <td className="px-3 py-2 border-r border-gray-300">
                        {data.measurement?.height || "-"}
                      </td>
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-24 border-r border-gray-300">
                        몸무게
                      </td>
                      <td className="px-3 py-2 border-r border-gray-300">
                        {data.measurement?.weight || "-"}
                      </td>
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-24 border-r border-gray-300">
                        어깨
                      </td>
                      <td className="px-3 py-2 border-r border-gray-300">
                        {data.measurement?.shoulder || "-"}
                      </td>
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-24 border-r border-gray-300">
                        허리둘레
                      </td>
                      <td className="px-3 py-2">
                        {data.measurement?.waist || "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 주문 내역 - 카테고리별로 그룹화 (season 기준) */}
              {(() => {
                // season 필드로 카테고리 분류
                const winterItems = data.order_items.filter((item) => {
                  const season = item.season?.toLowerCase() || "";
                  return season.includes("winter") || season.includes("동복");
                });

                const summerItems = data.order_items.filter((item) => {
                  const season = item.season?.toLowerCase() || "";
                  return season.includes("summer") || season.includes("하복");
                });

                const supplyItems = data.order_items.filter((item) => {
                  const cat = item.category?.toLowerCase() || "";
                  return (
                    cat.includes("용품") ||
                    cat.includes("supplies") ||
                    cat.includes("supply")
                  );
                });

                // 위 카테고리에 속하지 않는 나머지 아이템들
                const otherItems = data.order_items.filter((item) => {
                  return (
                    !winterItems.includes(item) &&
                    !summerItems.includes(item) &&
                    !supplyItems.includes(item)
                  );
                });

                const categories = [
                  {
                    name: "동복",
                    items: winterItems,
                    bgColor: "bg-blue-100",
                  },
                  {
                    name: "하복",
                    items: summerItems,
                    bgColor: "bg-green-100",
                  },
                  {
                    name: "용품",
                    items: supplyItems,
                    bgColor: "bg-yellow-100",
                  },
                  {
                    name: "기타",
                    items: otherItems,
                    bgColor: "bg-gray-100",
                  },
                ];

                return categories.map((category, catIndex) => (
                  <div key={catIndex} className="border-2 border-gray-300">
                    <div
                      className={`${category.bgColor} px-3 py-2 font-semibold border-b border-gray-300`}
                    >
                      {category.name}
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-300">
                          <th className="px-3 py-2 text-left border-r border-gray-300">
                            품목
                          </th>
                          <th className="px-3 py-2 text-left border-r border-gray-300">
                            사이즈
                          </th>
                          <th className="px-3 py-2 text-left border-r border-gray-300">
                            수량
                          </th>
                          <th className="px-3 py-2 text-left border-r border-gray-300">
                            수선/비고
                          </th>
                          <th className="px-3 py-2 text-left">금액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.length > 0 ? (
                          category.items.map((item, index) => (
                            <tr
                              key={item.id}
                              className={
                                index < category.items.length - 1
                                  ? "border-b border-gray-300"
                                  : ""
                              }
                            >
                              <td className="px-3 py-2 border-r border-gray-300">
                                {item.product_name}
                              </td>
                              <td className="px-3 py-2 border-r border-gray-300">
                                {item.size}
                              </td>
                              <td className="px-3 py-2 border-r border-gray-300">
                                {item.quantity}
                              </td>
                              <td className="px-3 py-2 border-r border-gray-300">
                                {item.customization || "-"}
                              </td>
                              <td className="px-3 py-2">
                                {item.subtotal.toLocaleString()}원
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-3 py-2 text-center text-gray-400"
                            >
                              -
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ));
              })()}

              {/* 배송 정보 */}
              <div className="border-2 border-gray-300">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-24 border-r border-gray-300">
                        배송
                      </td>
                      <td className="px-3 py-2">
                        {data.student?.delivery ? "배송" : "방문수령"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 금액 정보 */}
              <div className="border-2 border-gray-300">
                <div className="bg-purple-100 px-3 py-2 font-semibold border-b border-gray-300">
                  결제 정보
                </div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="px-3 py-2 bg-gray-100 font-semibold w-32 border-r border-gray-300">
                        총 금액
                      </td>
                      <td className="px-3 py-2 font-bold text-lg">
                        {data.order.total_amount.toLocaleString()}원
                      </td>
                    </tr>
                    {data.payments.length > 0 && (
                      <>
                        <tr className="border-b border-gray-300">
                          <td className="px-3 py-2 bg-gray-100 font-semibold border-r border-gray-300">
                            결제 방법
                          </td>
                          <td className="px-3 py-2">
                            {data.payments[0].method}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-300">
                          <td className="px-3 py-2 bg-gray-100 font-semibold border-r border-gray-300">
                            결제자
                          </td>
                          <td className="px-3 py-2">
                            {data.payments[0].payer_name || "-"}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 bg-gray-100 font-semibold border-r border-gray-300">
                            결제일시
                          </td>
                          <td className="px-3 py-2">
                            {formatDateTime(data.payments[0].paid_at)}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 비고 */}
              {data.order.notes && (
                <div className="border-2 border-gray-300">
                  <div className="px-3 py-2 bg-gray-100 font-semibold border-b border-gray-300">
                    비고
                  </div>
                  <div className="px-3 py-2">{data.order.notes}</div>
                </div>
              )}

              {/* 주문 정보 */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>주문번호: {data.order.order_number}</p>
                <p>주문일시: {formatDateTime(data.order.order_date)}</p>
                <p>주문상태: {data.order.status}</p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
