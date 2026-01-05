import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/staff/pending
 * 승인 대기 중인 스태프 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 승인 대기 중인 스태프 조회 (is_active = false)
    const [staffList, total] = await Promise.all([
      prisma.users.findMany({
        where: {
          is_active: false, // 승인 대기 중
          deleted_at: null,
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
          is_active: false,
          deleted_at: null,
        },
      }),
    ]);

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
            currently_measuring: 0,
            today_students_handled: 0,
            total_students_handled: 0,
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
