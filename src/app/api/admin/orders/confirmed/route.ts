import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/orders/confirmed
 * status가 confirmed인 주문 목록을 과거순으로 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // status가 confirmed인 주문 조회 (과거순 정렬)
    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where: {
          status: "confirmed",
          deleted_at: null,
        },
        include: {
          // students 테이블과 조인하여 학생 정보 가져오기
          // Note: schema에 relation이 없으므로 별도 쿼리 필요
        },
        skip,
        take: limit,
        orderBy: {
          order_date: "asc", // 과거순 정렬
        },
      }),
      prisma.orders.count({
        where: {
          status: "confirmed",
          deleted_at: null,
        },
      }),
    ]);

    // 학생 ID 목록 추출
    const studentIds = orders.map((order) => order.student_id);

    // 학생 정보 조회
    const students = await prisma.students.findMany({
      where: {
        id: {
          in: studentIds,
        },
        deleted_at: null,
      },
    });

    // 학생 ID를 키로 하는 맵 생성
    const studentMap = new Map(
      students.map((student) => [student.id.toString(), student])
    );

    // 측정 완료일을 가져오기 위해 measurements 조회
    const measurements = await prisma.measurements.findMany({
      where: {
        student_id: {
          in: studentIds,
        },
        status: "completed",
        deleted_at: null,
      },
      orderBy: {
        measured_at: "desc",
      },
    });

    // 학생 ID별로 가장 최근 측정 완료일 맵 생성
    const measurementMap = new Map<string, Date | null>();
    measurements.forEach((measurement) => {
      const studentIdStr = measurement.student_id.toString();
      if (
        !measurementMap.has(studentIdStr) &&
        measurement.measured_at !== null
      ) {
        measurementMap.set(studentIdStr, measurement.measured_at);
      }
    });

    // 응답 데이터 포맷
    const formattedOrders = orders.map((order) => {
      const student = studentMap.get(order.student_id.toString());
      const measuredAt = measurementMap.get(order.student_id.toString());

      // 신입생 여부 판단: admission_grade가 1이면 신입생, 아니면 재학생
      const studentType =
        student && student.admission_grade === BigInt(1) ? "신입생" : "재학생";

      return {
        id: Number(order.id),
        order_number: order.order_number,
        student_id: Number(order.student_id),
        student_name: student?.name || "",
        gender: student?.gender || "",
        school_name: student?.school_name || "",
        student_type: studentType,
        total_amount: Number(order.total_amount),
        order_date: order.order_date?.toISOString() || "",
        measured_at: measuredAt ? measuredAt.toISOString() : null,
        status: order.status,
        notes: order.notes,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        total,
        orders: formattedOrders,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
