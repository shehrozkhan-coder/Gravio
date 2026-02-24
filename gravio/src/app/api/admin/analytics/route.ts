import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();

    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: start },
    }).select("createdAt totalAmount status isPaid");

    const days: string[] = [];
    const dailyMap: Record<
      string,
      { date: string; orders: number; revenue: number }
    > = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      days.push(key);
      dailyMap[key] = {
        date: key,
        orders: 0,
        revenue: 0,
      };
    }

    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toISOString().slice(0, 10);
      if (!dailyMap[key]) return;
      dailyMap[key].orders += 1;
      if (o.isPaid) {
        dailyMap[key].revenue += Number(o.totalAmount) || 0;
      }
    });

    const ordersPerDay = days.map((d) => ({
      date: d,
      count: dailyMap[d]?.orders ?? 0,
    }));

    const revenuePerDay = days.map((d) => ({
      date: d,
      amount: dailyMap[d]?.revenue ?? 0,
    }));

    const allOrders = await Order.find().select("status totalAmount isPaid");

    const statusCounts: Record<string, number> = {};
    allOrders.forEach((o) => {
      const key = o.status || "unknown";
      statusCounts[key] = (statusCounts[key] || 0) + 1;
    });

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter((o) => o.isPaid)
      .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

    const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy" });
    const totalUsers = await User.countDocuments({ role: "user" });

    return NextResponse.json(
      {
        ordersPerDay,
        revenuePerDay,
        statusCounts,
        totals: {
          totalOrders,
          totalRevenue,
          totalDeliveryBoys,
          totalUsers,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: `analytics error: ${error}` },
      { status: 500 },
    );
  }
}

