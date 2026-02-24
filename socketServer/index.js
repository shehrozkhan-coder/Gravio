import express from 'express'
import http from 'http'
import dotenv from 'dotenv'
import { Server } from 'socket.io'
import axios from 'axios'

dotenv.config()
const app = express()
app.use(express.json()) // ✅ JSON body parse karne ke liye

const server = http.createServer(app)
const port = process.env.PORT || 5000

const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_BASE_URL
    }
})

// In-memory chat store: Map<orderId, ChatMessage[]>
// ChatMessage shape:
// { orderId, senderId, senderName, senderRole, message, timestamp }
const chatRooms = new Map()

io.on("connection", (socket) => {
    socket.on("identity", async (userId) => {
        try {
            console.log("✅ User connected:", userId)
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`, { userId, socketId: socket.id })
        } catch (error) {
            console.log("identity error:", error.message)
        }
    })

    socket.on("update-location", async ({ userId, latitude, longitude }) => {
        try {
            const location = {
                type: "Point",
                coordinates: [longitude, latitude]
            }
            await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`, { userId, location })
        } catch (error) {
            console.log("update-location error:", error.message)
        }
    })

    // ✅ Chat room join per order
    socket.on("join-chat", ({ orderId }) => {
        if (!orderId) return
        const room = `order_${orderId}`
        socket.join(room)

        const history = chatRooms.get(orderId) || []
        console.log(`👥 Socket ${socket.id} joined chat room for order ${orderId}, history length: ${history.length}`)
        socket.emit("chat-history", { orderId, messages: history })
    })

    // ✅ Chat messages between user & delivery boy
    socket.on("chat-message", (payload) => {
        const { orderId, senderName, message } = payload || {}
        if (!orderId) return

        console.log(`💬 Chat message in order ${orderId} from ${senderName}: ${message}`)

        const existing = chatRooms.get(orderId) || []
        existing.push(payload)
        const trimmed = existing.length > 200 ? existing.slice(-200) : existing
        chatRooms.set(orderId, trimmed)

        const room = `order_${orderId}`
        console.log(`📢 Broadcasting chat-message to room ${room}, listeners: unknown (socket.io handles this)`)
        io.to(room).emit("chat-message", payload)
    })

    socket.on("disconnect", () => {
        console.log("❌ User Disconnected", socket.id)
    })
})

// ✅ Next.js se order broadcast request aayegi yahan
app.post("/broadcast-order", (req, res) => {
    const { order, deliveryBoys = [], adminPayload } = req.body

    // ✅ Nearby delivery boys ko order bhejo
    if (Array.isArray(deliveryBoys) && deliveryBoys.length > 0) {
        deliveryBoys.forEach((boy) => {
            if (boy.socketId) {
                io.to(boy.socketId).emit("new-order", {
                    orderId: order._id,
                    address: order.address,
                    totalAmount: order.totalAmount,
                    items: order.items,
                })
                console.log(`📦 Order broadcast to delivery boy: ${boy._id}`)
            }
        })
    }

    // ✅ Admin ko real-time naya order dikhane ke liye
    if (adminPayload) {
        io.emit("new-order-for-admin", adminPayload)
        console.log("🧑‍💼 Admin ko new-order-for-admin emit hua")
    }

    res.json({ success: true, broadcasted: deliveryBoys.length })
})

// ✅ Delivery boy accept kare → admin + user ko notify karo
app.post("/notify-assignment", (req, res) => {
    const { adminNotification, userNotification } = req.body

    if (adminNotification) {
        io.emit("delivery-boy-assigned", adminNotification)
        console.log("🧑‍💼 Admin ko delivery-boy-assigned emit hua")
    }

    if (userNotification?.socketId) {
        io.to(userNotification.socketId).emit("order-accepted", userNotification)
        console.log("👤 User ko order-accepted emit hua")
    }

    res.json({ success: true })
})

// ✅ Delivery boy ki location user tak forward karo (live tracking)
app.post("/forward-location-to-user", (req, res) => {
    const { socketId, orderId, location, deliveryBoy } = req.body

    if (socketId) {
        io.to(socketId).emit("delivery-location", {
            orderId,
            location,
            deliveryBoy,
        })
        console.log("📍 delivery-location emit hua user ko", { orderId })
    }

    res.json({ success: true })
})

server.listen(port, () => {
    console.log("🚀 Server started at port", port)
})