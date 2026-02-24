import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();
    const orders = await Order.find({ user: session?.user?.id })
      .populate("user")
      .populate("assignedDeliveryBoy")
      .sort({ createdAt: -1 });

    if (!orders) {
      return NextResponse.json(
        { message: "Orders not found" },
        { status: 400 },
      );
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get all orders error: ${error}` },
      { status: 500 },
    );
  }
}
