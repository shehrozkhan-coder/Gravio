import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> } // ✅ Next.js 16 typing
) {
    try {
        await connectDb();
        const { userId } = await context.params; // ✅ await params

        const orders = await Order.find({ assignedDeliveryBoy: userId })
            .sort({ createdAt: -1 });

        return NextResponse.json(orders, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: `delivery orders error: ${error}` },
            { status: 500 }
        );
    }
}