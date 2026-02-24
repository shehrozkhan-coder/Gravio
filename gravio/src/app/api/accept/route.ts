import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import axios from "axios";

// ✅ Delivery boy order accept kare
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { orderId, deliveryBoyId } = await req.json();

    // ✅ Validation
    if (!orderId || !deliveryBoyId) {
      return NextResponse.json(
        { message: "orderId aur deliveryBoyId required hain" },
        { status: 400 },
      );
    }

    // ✅ String ko ObjectId mein convert karo
    let orderObjectId: mongoose.Types.ObjectId;
    let deliveryBoyObjectId: mongoose.Types.ObjectId;

    try {
      orderObjectId = new mongoose.Types.ObjectId(orderId);
      deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyId);
    } catch {
      return NextResponse.json(
        { message: "Invalid orderId ya deliveryBoyId format" },
        { status: 400 },
      );
    }

    // ✅ Assignment dhundo
    const assignment = await DeliveryAssignment.findOne({ order: orderObjectId });
    if (!assignment) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 400 },
      );
    }

    // ✅ Agar already kisi ne accept kar liya
    if (assignment.assignedTo) {
      return NextResponse.json(
        { message: "Order already kisi aur ne accept kar liya" },
        { status: 400 },
      );
    }

    // ✅ Assignment update karo
    assignment.assignedTo = deliveryBoyObjectId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    // ✅ Order mein bhi delivery boy save karo
    const order = await Order.findByIdAndUpdate(
      orderObjectId,
      { assignedDeliveryBoy: deliveryBoyObjectId },
      { new: true },
    )
      .populate("user")
      .populate("assignedDeliveryBoy");

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 400 },
      );
    }

    // ✅ Delivery boy + user detail nikalo
    const deliveryBoy = order.assignedDeliveryBoy as {
      name?: string;
      mobile?: string;
    } | null;
    const customer = order.user as {
      socketId?: string;
    } | null;

    // ✅ Admin + user ko real-time socket notification
    try {
      await axios.post(`${process.env.SOCKET_SERVER_URL}/notify-assignment`, {
        adminNotification: {
          deliveryBoy: {
            name: deliveryBoy?.name,
            mobile: deliveryBoy?.mobile,
          },
          order: {
            _id: order._id,
            totalAmount: order.totalAmount,
            address: order.address,
          },
          acceptedAt: assignment.acceptedAt,
        },
        userNotification: {
          socketId: customer?.socketId,
          orderId: order._id,
          deliveryBoy: {
            name: deliveryBoy?.name,
            mobile: deliveryBoy?.mobile,
          },
        },
      });
    } catch (err) {
      console.error("notify-assignment error:", err);
    }

    return NextResponse.json({ success: true, order, assignment }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `accept order error: ${error}` },
      { status: 500 },
    );
  }
}