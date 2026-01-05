import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/staff
 * 승인된 스태프 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 2. 데이터베이스 쿼리 - 승인된 스태프만 조회
    const [staffList, total] = await Promise.all([
      prisma.users.findMany({
        where: {
          is_active: true, // 승인된 스태프
          deleted_at: null, // 삭제되지 않은 사용자
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          employee_id: true,
          employee_name: true,
          gender: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          last_login: true,
        },
      }),
      prisma.users.count({
        where: {
          is_active: true,
          deleted_at: null,
        },
      }),
    ]);

    // 3. 응답 데이터 포맷 (기존 API 형식에 맞춤)
    return NextResponse.json({
      success: true,
      data: {
        total,
        users: staffList.map((staff) => ({
          id: Number(staff.id),
          employee_id: staff.employee_id,
          employee_name: staff.employee_name,
          gender: staff.gender || "",
          role: staff.role,
          is_active: staff.is_active || false,
          created_at: staff.created_at?.toISOString() || "",
          updated_at: staff.updated_at?.toISOString() || "",
          last_login: staff.last_login?.toISOString() || null,
          staff_stats: {
            currently_measuring: 0, // TODO: 실제 측정 중인 학생 수 계산
            today_students_handled: 0, // TODO: 오늘 처리한 학생 수
            total_students_handled: 0, // TODO: 총 처리한 학생 수
          },
        })),
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
