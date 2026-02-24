import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, items, paymentMethod, totalAmount, address } =
      await req.json();
    if (!items || !userId || !paymentMethod || !totalAmount || !address)
      return NextResponse.json(
        { message: "please send all Credentials" },
        { status: 400 },
      );

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 400 });
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      totalAmount,
      address,
    });

    user.cart = [];
    await user.save();

    // ✅ Admin ko real-time naya order dikhao (delivery boys ko abhi nahi)
    try {
      await axios.post(`${process.env.SOCKET_SERVER_URL}/broadcast-order`, {
        order: newOrder,
        deliveryBoys: [],
        adminPayload: {
          order: {
            _id: newOrder._id,
            totalAmount: newOrder.totalAmount,
            paymentMethod: newOrder.paymentMethod,
            status: newOrder.status,
            createdAt: newOrder.createdAt,
            address: newOrder.address,
            items: newOrder.items,
          },
          user: {
            name: user.name,
            mobile: user.mobile,
          },
        },
      });
    } catch (err) {
      console.error("broadcast-order (admin) error:", err);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: `placeOrder error ${error}` },
      { status: 500 },
    );
  }
}