import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, location } = await req.json();

    if (!userId || !location) {
      return NextResponse.json(
        { message: "missing UserId or location" },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndUpdate(userId, { location });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400 },
      );
    }

    // ✅ Agar ye delivery boy hai aur uske paas active order hai toh user ko live location bhejo
    try {
      const activeOrder = await Order.findOne({
        assignedDeliveryBoy: userId,
        status: { $in: ["processing", "shipped"] },
      })
        .populate("user")
        .populate("assignedDeliveryBoy");

      const activeOrderUser = activeOrder?.user as { socketId?: string } | null;
      const activeOrderDeliveryBoy = activeOrder?.assignedDeliveryBoy as {
        name?: string;
        mobile?: string;
      } | null;

      if (activeOrder && activeOrderUser?.socketId) {
        await axios.post(`${process.env.SOCKET_SERVER_URL}/forward-location-to-user`, {
          socketId: activeOrderUser.socketId,
          orderId: activeOrder._id,
          location,
          deliveryBoy: {
            name: activeOrderDeliveryBoy?.name,
            mobile: activeOrderDeliveryBoy?.mobile,
          },
        });
      }
    } catch (err) {
      console.error("forward-location-to-user error:", err);
    }

    return NextResponse.json(
      { message: "location updated" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: `update location error ${error}` },
      { status: 500 },
    );
  }
}