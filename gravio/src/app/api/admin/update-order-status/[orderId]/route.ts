import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    await connectDb();

    const { orderId } = await context.params;
    const { status } = await req.json();

    // Order find karo
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Order status update karo
    order.status = status;
    await order.save();

    // Agar delivered hua toh DeliveryAssignment bhi update karo
    if (status === "delivered") {
      const assignment = await DeliveryAssignment.findOne({ order: orderId });
      if (assignment) {
        assignment.status = "completed";
        await assignment.save();
      }
    }

    return NextResponse.json(
      { success: true, order },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Order update error: ${error}` },
      { status: 500 }
    );
  }
}