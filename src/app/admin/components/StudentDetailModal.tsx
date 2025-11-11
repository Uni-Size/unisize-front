"use client";

import { useState } from "react";

export interface StudentDetailData {
  // 학생 정보
  studentName: string;
  gender: string;
  school: string;
  enrollmentSchool: string;
  studentPhone: string;
  parentPhone: string;

  // 측정 정보
  measurements: {
    date: string;
    height: number;
    weight: number;
    shoulderWidth: number;
    waist: number;
  };

  // 동복 사이즈
  winterUniform: {
    jacket: string;
    knitVest: string;
    blouse: string;
    skirt?: string;
    pants?: string;
    waistSize?: string;
    inseam?: string;
  };

  // 하복 사이즈
  summerUniform: {
    shirt: string;
    shortPants?: string;
  };

  // 용품 사이즈
  accessories: {
    dressShirt: string;
    shortSleeveTop: string;
    longSleeveTop: string;
    uniformJumper: string;
    schoolJacket: string;
    summerJacket: string;
    gymShorts: string;
  };

  // 용품 리스트
  products: Array<{
    category: string;
    name: string;
    color?: string;
    size?: string;
    quantity: number;
    memo?: string;
  }>;

  // 구입 로그
  purchaseLogs: Array<{
    date: string;
    items: string;
    memo: string;
  }>;
}

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StudentDetailData;
  mode: "admin" | "invoice";
  onPaymentComplete?: () => void;
  onAddModify?: () => void;
}

export default function StudentDetailModal({
  isOpen,
  onClose,
  data,
  mode,
  onPaymentComplete,
  onAddModify,
}: StudentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"winter" | "summer">("winter");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gray-50 border-b px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex gap-8">
                <div className="flex gap-2">
                  <span className="text-gray-600">출신 학교</span>
                  <span className="font-medium">{data.school}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">입학 학교</span>
                  <span className="font-medium">{data.enrollmentSchool}</span>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="flex gap-2">
                  <span className="text-gray-600">학생 이름</span>
                  <span className="font-medium">{data.studentName} ({data.gender})</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">연락처</span>
                  <span className="font-medium">학생 : {data.studentPhone}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">학부모 : {data.parentPhone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 측정 정보 */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold text-gray-700 mb-3">[{data.measurements.date}] 채촌</h3>
            <div className="grid grid-cols-6 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-600">키</span>
                <span className="font-medium">{data.measurements.height}cm</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600">몸무게</span>
                <span className="font-medium">{data.measurements.weight}kg</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600">어깨넓이</span>
                <span className="font-medium">{data.measurements.shoulderWidth}cm</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600">허리둘레</span>
                <span className="font-medium">{data.measurements.waist}inch</span>
              </div>
            </div>
          </div>

          {/* 동복/하복 탭 */}
          <div>
            <div className="flex border-b mb-4">
              <button
                onClick={() => setActiveTab("winter")}
                className={`px-6 py-2 font-medium ${
                  activeTab === "winter"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
              >
                동복
              </button>
              <button
                onClick={() => setActiveTab("summer")}
                className={`px-6 py-2 font-medium ${
                  activeTab === "summer"
                    ? "text-pink-600 border-b-2 border-pink-600"
                    : "text-gray-500"
                }`}
              >
                하복
              </button>
            </div>

            {/* 동복 사이즈 */}
            {activeTab === "winter" && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-700 mb-3">동복 사이즈</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">자켓</td>
                        <td className="py-2 px-3">{data.winterUniform.jacket}</td>
                        <td className="py-2 px-3 bg-gray-50 font-medium">셔츠 사이즈</td>
                        <td className="py-2 px-3">{data.summerUniform.shirt}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">니트조끼</td>
                        <td className="py-2 px-3">{data.winterUniform.knitVest}</td>
                        <td className="py-2 px-3 bg-gray-50 font-medium">하복 사이즈</td>
                        <td className="py-2 px-3"></td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">블라우스</td>
                        <td className="py-2 px-3">{data.winterUniform.blouse}</td>
                      </tr>
                      {data.winterUniform.skirt && (
                        <tr className="border-b">
                          <td className="py-2 px-3 bg-gray-50 font-medium">치마</td>
                          <td className="py-2 px-3">{data.winterUniform.skirt}</td>
                          <td className="py-2 px-3 bg-gray-50 font-medium">허리 사이즈</td>
                          <td className="py-2 px-3"></td>
                        </tr>
                      )}
                      {data.winterUniform.pants && (
                        <tr className="border-b">
                          <td className="py-2 px-3 bg-gray-50 font-medium">바지</td>
                          <td className="py-2 px-3">{data.winterUniform.pants}</td>
                          <td className="py-2 px-3 bg-gray-50 font-medium">가랑이 길이</td>
                          <td className="py-2 px-3">{data.winterUniform.inseam}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-bold text-gray-700 mb-3">용품 사이즈</h4>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">와이셔츠</td>
                        <td className="py-2 px-3">{data.accessories.dressShirt}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">교복 티 반팔</td>
                        <td className="py-2 px-3">{data.accessories.shortSleeveTop}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">교복 티 긴팔</td>
                        <td className="py-2 px-3">{data.accessories.longSleeveTop}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">교복 점퍼</td>
                        <td className="py-2 px-3">{data.accessories.uniformJumper}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">교복 조끼</td>
                        <td className="py-2 px-3">{data.accessories.schoolJacket}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">하복 조끼</td>
                        <td className="py-2 px-3">{data.accessories.summerJacket}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">체육복 하의</td>
                        <td className="py-2 px-3">{data.accessories.gymShorts}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 하복 탭 내용 */}
            {activeTab === "summer" && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-700">하복 사이즈</h4>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3 bg-gray-50 font-medium">셔츠</td>
                      <td className="py-2 px-3">{data.summerUniform.shirt}</td>
                    </tr>
                    {data.summerUniform.shortPants && (
                      <tr className="border-b">
                        <td className="py-2 px-3 bg-gray-50 font-medium">반바지</td>
                        <td className="py-2 px-3">{data.summerUniform.shortPants}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 용품 */}
          <div>
            <h4 className="font-bold text-gray-700 mb-3">용품</h4>
            <table className="w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left font-medium">품목</th>
                  <th className="py-2 px-3 text-left font-medium">품명</th>
                  <th className="py-2 px-3 text-left font-medium">색상</th>
                  <th className="py-2 px-3 text-left font-medium">사이즈</th>
                  <th className="py-2 px-3 text-center font-medium">수량</th>
                  <th className="py-2 px-3 text-left font-medium">비고</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">{product.category}</td>
                    <td className="py-2 px-3">{product.name}</td>
                    <td className="py-2 px-3">{product.color || "-"}</td>
                    <td className="py-2 px-3">{product.size || "-"}</td>
                    <td className="py-2 px-3 text-center">{product.quantity}</td>
                    <td className="py-2 px-3">{product.memo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 구입 로그 */}
          <div>
            <h4 className="font-bold text-gray-700 mb-3">구입 로그</h4>
            <div className="space-y-2">
              {data.purchaseLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-4 text-sm border-b pb-2">
                  <span className="text-gray-600">{log.date}</span>
                  <span className="flex-1">{log.items}</span>
                  <button className="text-blue-600 hover:underline">파일</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-center gap-3">
          {mode === "admin" && (
            <button
              onClick={() => {
                onPaymentComplete?.();
                onClose();
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              결제 완료
            </button>
          )}
          {mode === "invoice" && (
            <button
              onClick={onAddModify}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              추가/수정
            </button>
          )}
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
