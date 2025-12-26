import React from "react";

interface PDFTemplateProps {
  studentData: {
    name: string;
    gender: string;
    birth_date: string;
    student_phone: string;
    guardian_phone: string;
    admission_year: number;
    admission_grade: number;
    school_name: string;
    address: string;
    delivery: boolean;
  };
  bodyMeasurements: {
    height: number;
    weight: number;
    shoulder: number;
    waist: number;
  };
  uniformItems: Array<{
    name: string;
    season: string;
    selectedSize: number;
    customization: string;
    purchaseCount: number;
  }>;
  supplyItems: Array<{
    name: string;
    category: string;
    size: string;
    quantity?: number;
  }>;
  measurementDate: string;
}

export const MeasurementPDFTemplate: React.FC<PDFTemplateProps> = ({
  studentData,
  bodyMeasurements,
  uniformItems,
  supplyItems,
  measurementDate,
}) => {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#000000",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "24px", margin: "0 0 10px 0" }}>
          교복 측정 결과서
        </h1>
        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
          측정일: {new Date(measurementDate).toLocaleDateString("ko-KR")}
        </p>
      </div>

      {/* School & Student Info */}
      <section style={{ marginBottom: "25px" }}>
        <h2
          style={{
            fontSize: "16px",
            borderBottom: "2px solid #000",
            paddingBottom: "5px",
            marginBottom: "15px",
          }}
        >
          학생 정보
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  width: "25%",
                  fontWeight: "bold",
                }}
              >
                학교
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.school_name}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  width: "25%",
                  fontWeight: "bold",
                }}
              >
                입학년도
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.admission_year}년 {studentData.admission_grade}학년
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                이름
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.name}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                성별
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.gender === "M" ? "남" : "여"}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                생년월일
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.birth_date}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                학생 연락처
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.student_phone}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                보호자 연락처
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.guardian_phone}
              </td>
              <td
                style={{
                  padding: "8px",
                  border: "1px solid #ddd",
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                }}
              >
                배송 여부
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                {studentData.delivery ? "배송" : "매장 수령"}
              </td>
            </tr>
            {studentData.delivery && (
              <tr>
                <td
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#f5f5f5",
                    fontWeight: "bold",
                  }}
                >
                  배송 주소
                </td>
                <td
                  colSpan={3}
                  style={{ padding: "8px", border: "1px solid #ddd" }}
                >
                  {studentData.address}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Body Measurements */}
      <section style={{ marginBottom: "25px" }}>
        <h2
          style={{
            fontSize: "16px",
            borderBottom: "2px solid #000",
            paddingBottom: "5px",
            marginBottom: "15px",
          }}
        >
          신체 측정 정보
        </h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>키</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                몸무게
              </th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>어깨</th>
              <th style={{ padding: "8px", border: "1px solid #ddd" }}>허리</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                {bodyMeasurements.height} cm
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                {bodyMeasurements.weight} kg
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                {bodyMeasurements.shoulder} cm
              </td>
              <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                {bodyMeasurements.waist} cm
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Uniform Items */}
      {uniformItems.length > 0 && (
        <section style={{ marginBottom: "25px" }}>
          <h2
            style={{
              fontSize: "16px",
              borderBottom: "2px solid #000",
              paddingBottom: "5px",
              marginBottom: "15px",
            }}
          >
            교복 선택 내역
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  품목
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  계절
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  사이즈
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  수선 내용
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  수량
                </th>
              </tr>
            </thead>
            <tbody>
              {uniformItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    {item.season === "winter"
                      ? "동복"
                      : item.season === "summer"
                        ? "하복"
                        : "사계절"}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    {item.selectedSize}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {item.customization || "-"}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    {item.purchaseCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Supply Items */}
      {supplyItems.length > 0 && (
        <section style={{ marginBottom: "25px" }}>
          <h2
            style={{
              fontSize: "16px",
              borderBottom: "2px solid #000",
              paddingBottom: "5px",
              marginBottom: "15px",
            }}
          >
            용품 선택 내역
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  품목
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  분류
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  사이즈
                </th>
                <th style={{ padding: "8px", border: "1px solid #ddd" }}>
                  수량
                </th>
              </tr>
            </thead>
            <tbody>
              {supplyItems.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    {item.category}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    {item.size}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
                    {item.quantity || 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "20px",
          borderTop: "1px solid #ddd",
          fontSize: "10px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          이 문서는 UniSize 시스템에서 자동 생성되었습니다.
        </p>
        <p style={{ margin: "5px 0" }}>
          문의사항이 있으시면 담당자에게 연락해 주세요.
        </p>
      </div>
    </div>
  );
};
