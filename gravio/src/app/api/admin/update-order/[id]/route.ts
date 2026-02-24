import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ sirf yaha change
) {
    try {
        await connectDb();
        const { id } = await context.params; // ✅ aur yaha await laga do
        const { status } = await req.json();

        const order = await Order.findById(id).populate("user");
        if (!order) {
            return NextResponse.json({ message: "Order not found" }, { status: 400 });
        }

        order.status = status;

        // ✅ Jab admin status "shipped" kare aur assignment pehle se na ho
        if (status === "shipped" && !order.assignment) {

            const nearbyDeliveryBoys = await User.find({
                role: "deliveryBoy",
                isOnline: true,
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: "Point",
                            coordinates: [order.address.longitude, order.address.latitude],
                        },
                        $maxDistance: 5000,
                    },
                },
            }).select("_id socketId");

            if (nearbyDeliveryBoys.length === 0) {
                return NextResponse.json(
                    { message: "Koi delivery boy available nahi hai 5KM range mein" },
                    { status: 400 }
                );
            }

            const assignment = await DeliveryAssignment.create({
                order: order._id,
                broadcastedTo: nearbyDeliveryBoys.map((b) => b._id),
                assignedTo: null,
                status: "broadcasted",
            });

            order.assignment = assignment._id;

            await axios.post(`${process.env.SOCKET_SERVER_URL}/broadcast-order`, {
                order,
                deliveryBoys: nearbyDeliveryBoys,
            });

            console.log(`📦 Order ${id} broadcasted to ${nearbyDeliveryBoys.length} delivery boys`);
        }

        await order.save();
        return NextResponse.json(order, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: `status update error: ${error}` },
            { status: 500 }
        );
    }
}