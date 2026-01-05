import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/orders/[orderId]
 * 특정 주문의 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId);

    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order ID",
        },
        { status: 400 }
      );
    }

    // 주문 정보 조회
    const order = await prisma.orders.findUnique({
      where: {
        id: BigInt(orderId),
        deleted_at: null,
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // 학생 정보 조회
    const student = await prisma.students.findUnique({
      where: {
        id: order.student_id,
        deleted_at: null,
      },
    });

    // 주문 아이템 조회
    const orderItems = await prisma.order_items.findMany({
      where: {
        order_id: BigInt(orderId),
        deleted_at: null,
      },
    });

    // 제품 정보 조회
    const productIds = orderItems.map((item) => item.product_id);
    const products = await prisma.products.findMany({
      where: {
        id: {
          in: productIds,
        },
        deleted_at: null,
      },
    });

    const productMap = new Map(
      products.map((product) => [product.id.toString(), product])
    );

    // 측정 정보 조회
    const measurements = await prisma.measurements.findMany({
      where: {
        student_id: order.student_id,
        deleted_at: null,
      },
      orderBy: {
        measured_at: "desc",
      },
      take: 1,
    });

    const measurement = measurements[0] || null;

    // 결제 정보 조회
    const payments = await prisma.payments.findMany({
      where: {
        order_id: BigInt(orderId),
        deleted_at: null,
      },
    });

    // 응답 데이터 포맷
    const formattedOrderItems = orderItems.map((item) => {
      const product = productMap.get(item.product_id.toString());
      return {
        id: Number(item.id),
        product_id: Number(item.product_id),
        product_name: product?.name || "",
        category: product?.category || "",
        season: product?.season || "",
        size: item.size,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        customization: item.customization,
        delivery_status: item.delivery_status,
      };
    });

    const response = {
      success: true,
      data: {
        order: {
          id: Number(order.id),
          order_number: order.order_number,
          student_id: Number(order.student_id),
          total_amount: Number(order.total_amount),
          status: order.status,
          order_date: order.order_date?.toISOString() || "",
          delivery_date: order.delivery_date?.toISOString() || null,
          notes: order.notes,
          signature: order.signature,
          custom_details: order.custom_details,
        },
        student: student
          ? {
              id: Number(student.id),
              name: student.name,
              school_name: student.school_name,
              grade: Number(student.grade),
              class_name: student.class_name,
              student_number: student.student_number,
              phone: student.phone,
              parent_phone: student.parent_phone,
              gender: student.gender,
              birth_date: student.birth_date?.toISOString() || null,
              admission_year: student.admission_year
                ? Number(student.admission_year)
                : null,
              admission_grade: student.admission_grade
                ? Number(student.admission_grade)
                : null,
              delivery: student.delivery,
            }
          : null,
        measurement: measurement
          ? {
              id: Number(measurement.id),
              height: measurement.height ? Number(measurement.height) : null,
              weight: measurement.weight ? Number(measurement.weight) : null,
              shoulder: measurement.shoulder
                ? Number(measurement.shoulder)
                : null,
              waist: measurement.waist ? Number(measurement.waist) : null,
              recommended_size: measurement.recommended_size,
              notes: measurement.notes,
              measured_at: measurement.measured_at?.toISOString() || null,
              status: measurement.status,
            }
          : null,
        order_items: formattedOrderItems,
        payments: payments.map((payment) => ({
          id: Number(payment.id),
          amount: Number(payment.amount),
          method: payment.method,
          status: payment.status,
          transaction_id: payment.transaction_id,
          payer_name: payment.payer_name,
          payer_phone: payment.payer_phone,
          paid_at: payment.paid_at?.toISOString() || null,
        })),
      },
    };

    return NextResponse.json(response);
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
