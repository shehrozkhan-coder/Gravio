import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { userId, items, paymentMethod, totalAmount, address } = await req.json();

    if (!items || !userId || !paymentMethod || !totalAmount || !address) {
      return NextResponse.json(
        { message: "please send all Credentials" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "user not found" },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      user: userId,
      items,
      paymentMethod,
      totalAmount,
      address,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_BASE_URL}/user/order-success`,
      cancel_url: `${process.env.NEXT_BASE_URL}/user/checkout`,
      line_items: [
        {
          price_data: {
            currency: "pkr", // ✅ fix
            product_data: {
              name: "Grovia Order Payment",
            },
            unit_amount: Math.round(parseFloat(totalAmount) * 100), // ✅ fix
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: newOrder._id.toString() },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });

  } catch (error) {
    console.error("Payment error:", error); // ✅ proper logging
    return NextResponse.json(
      { message: `order payment error ${error}` },
      { status: 500 }
    );
  }
}