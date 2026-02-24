import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    if (!sig) {
      throw new Error("Missing stripe-signature header");
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    console.log("✅ Webhook event type:", event.type);
  } catch (error) {
    console.log("❌ Signature verification failed:", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 400 });
  }

  if (event?.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("✅ Session metadata:", session?.metadata);
    console.log("✅ Order ID:", session?.metadata?.orderId);

    await connectDb();

    const updated = await Order.findByIdAndUpdate(
      session?.metadata?.orderId,
      { isPaid: true },
      { new: true },
    );
    console.log("✅ Updated order:", updated);
  }

  return NextResponse.json({ recieved: true }, { status: 200 });
}