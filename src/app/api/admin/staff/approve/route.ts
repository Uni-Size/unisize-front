import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/admin/staff/approve
 * 스태프 승인 (단일 또는 일괄)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 바디 파싱
    const body = await request.json();
    const { user_ids } = body;

    // 2. 입력값 검증
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          message: "user_ids는 비어있지 않은 배열이어야 합니다.",
        },
        { status: 400 }
      );
    }

    // 3. 스태프 승인 처리
    const result = await prisma.users.updateMany({
      where: {
        id: {
          in: user_ids.map((id: number) => BigInt(id)),
        },
        deleted_at: null, // 삭제되지 않은 사용자만
      },
      data: {
        is_active: true,
        updated_at: new Date(),
      },
    });

    // 4. 성공 응답
    return NextResponse.json({
      success: true,
      data: {
        approved_count: result.count,
      },
      message: `${result.count}명의 스태프가 승인되었습니다.`,
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
