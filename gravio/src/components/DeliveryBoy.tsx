"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, CheckCircle, XCircle, Banknote,
  ChevronRight, Bike, Star, TrendingUp, Bell, Phone, MessageCircle
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import dynamic from "next/dynamic";

// ✅ Map SSR disable karo
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then(m => m.Polyline), { ssr: false });

import L from "leaflet";

import "leaflet/dist/leaflet.css";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  _id?: string;
  orderId?: string;
  items: OrderItem[];
  totalAmount: number;
  address: {
    fullName: string;
    mobile: string;
    fullAddress: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  paymentMethod: "cod" | "online";
  status: string;
}

interface ChatMessage {
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: "user" | "deliveryBoy";
  message: string;
  timestamp: number;
}

export default function DeliveryBoy() {
  const { data: session } = useSession();
  const [incomingOrder, setIncomingOrder] = useState<Order | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [activeTab, setActiveTab] = useState<"active" | "delivered">("active");

  // ✅ Map state
  const [showMap, setShowMap] = useState(false);
  const [activeMapOrder, setActiveMapOrder] = useState<Order | null>(null);
  const [myLocation, setMyLocation] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // ✅ Delivery boy ki live location
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition((pos) => {
      setMyLocation([pos.coords.latitude, pos.coords.longitude]);
    });
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    const s: Socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER!, {
      transports: ["websocket"],
    });
    socketRef.current = s;
    s.emit("identity", session.user.id);

    s.on("new-order", (order: Order) => {
      setIncomingOrder(order);
      setTimer(30);
    });

    s.on("shipped-order", (data: { order: Order }) => {
      setAssignedOrders((prev) =>
        prev.map((o) =>
          o._id === data.order._id ? { ...o, status: "shipped" } : o
        )
      );
    });

    // Chat history + messages
    s.on("chat-history", (payload: { orderId: string; messages: ChatMessage[] }) => {
      console.log("📥 chat-history (delivery boy):", payload);
      setChatMessages(payload.messages || []);
      setUnreadCount(0);
    });

    s.on("chat-message", (msg: ChatMessage) => {
      console.log("📥 chat-message (delivery boy):", msg);
      setChatMessages((prev) => [...prev, msg]);
      setUnreadCount((c) => (showChat ? c : c + 1));
    });

    return () => { s.disconnect(); };
  }, [session, showChat]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const res = await axios.get(`/api/orders/delivery/${session?.user?.id}`);
        setAssignedOrders(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (session?.user?.id) fetchMyOrders();
  }, [session]);

  useEffect(() => {
    if (!incomingOrder) return;
    if (timer === 0) { setIncomingOrder(null); return; }
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [incomingOrder, timer]);

  const handleAccept = async () => {
    if (!incomingOrder || !session?.user?.id) return;
    setLoading(true);
    try {
      const orderId = incomingOrder.orderId || incomingOrder._id;
      await axios.post("/api/accept", { orderId, deliveryBoyId: session.user.id });
      const accepted = { ...incomingOrder, status: "shipped" };
      setAssignedOrders((prev) => [...prev, accepted]);
      setIncomingOrder(null);

      // ✅ Map open karo accepted order ke sath
      setActiveMapOrder(accepted);
      setShowMap(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.response?.data?.message || "Order accept nahi hua");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => setIncomingOrder(null);

  const handleDelivered = async (orderId: string) => {
    try {
      await axios.patch(`/api/admin/update-order/${orderId}`, { status: "delivered" });
      setAssignedOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "delivered" } : o))
      );
      // ✅ Map band karo agar yahi order tha
      if (activeMapOrder?._id === orderId) {
        setShowMap(false);
        setActiveMapOrder(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const activeOrders = assignedOrders.filter((o) => o.status !== "delivered");
  const deliveredOrders = assignedOrders.filter((o) => o.status === "delivered");
  const earnings = deliveredOrders.reduce((sum, o) => sum + o.totalAmount * 0.1, 0);

  // Fetch route when we have both locations
  useEffect(() => {
    const fetchRoute = async () => {
      if (!myLocation || !activeMapOrder?.address?.latitude || !activeMapOrder.address.longitude) return;
      try {
        const [lat1, lon1] = myLocation;
        const lat2 = activeMapOrder.address.latitude;
        const lon2 = activeMapOrder.address.longitude;
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        const route = data.routes?.[0];
        if (!route) return;
        const coords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        setRouteCoords(coords);
        const distanceKmVal = (route.distance || 0) / 1000;
        const durationMinVal = (route.duration || 0) / 60;
        setDistanceKm(distanceKmVal);
        setEtaMinutes(durationMinVal);
      } catch (e) {
        console.error("route error", e);
      }
    };
    fetchRoute();
  }, [myLocation, activeMapOrder]);

  const bikeIcon = useMemo(
    () =>
      L.icon({
        iconUrl:
          "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6b2.svg",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  );

  const handleSendChat = () => {
    if (!socketRef.current || !chatInput.trim() || !activeMapOrder || !session?.user?.id) return;
    const msg: ChatMessage = {
      orderId: activeMapOrder._id || activeMapOrder.orderId!,
      senderId: session.user.id,
      senderName: session.user.name || "Delivery boy",
      senderRole: "deliveryBoy",
      message: chatInput.trim(),
      timestamp: Date.now(),
    };
    console.log("📤 sending chat-message (delivery boy):", msg);
    socketRef.current.emit("chat-message", msg);
    setChatInput("");
  };

  const openChatForOrder = (order: Order) => {
    if (!socketRef.current) return;
    setActiveMapOrder(order);
    socketRef.current.emit("join-chat", { orderId: order._id || order.orderId });
    setShowChat(true);
    setUnreadCount(0);
  };

  // Auto scroll chat to latest
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-6 space-y-5 mt-20" style={{ fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        .card { background: #ffffff; border: 1px solid rgba(0,0,0,0.08); border-radius: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .card-hover { transition: all 0.25s ease; }
        .card-hover:hover { background: #f9fafb; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .incoming-card {
          background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02));
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 24px;
          box-shadow: 0 2px 12px rgba(34,197,94,0.08);
        }
        .timer-svg { transform: rotate(-90deg); transform-origin: 50% 50%; }
        .inner-card { background: #f8fafc; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; }
        .tab-active { background: #1f2937; color: #ffffff; }
        .tab-inactive { color: #9ca3af; }
        .pill { border-radius: 999px; font-size: 11px; font-weight: 600; padding: 3px 10px; }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.015), transparent);
          background-size: 300% 100%;
          animation: sh 2.5s infinite;
          position: absolute; inset: 0; border-radius: 24px; pointer-events: none;
        }
        @keyframes sh { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* ✅ Map Modal */}
      <AnimatePresence>
        {showMap && activeMapOrder && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Map Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Delivery Route</p>
                <p className="text-xs text-gray-400">
                  {activeMapOrder.address?.fullName} — {activeMapOrder.address?.city}
                </p>
                {distanceKm != null && etaMinutes != null && (
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Approx {distanceKm.toFixed(1)} km · {Math.round(etaMinutes)} min
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openChatForOrder(activeMapOrder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[11px] font-semibold text-emerald-700"
                >
                  <MessageCircle size={12} />
                  Chat
                </button>
                <button
                  onClick={() => setShowMap(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="relative h-64 px-4 pt-3">
              {myLocation && (
                <MapContainer
                  center={myLocation}
                  zoom={13}
                  className="w-full h-full rounded-2xl overflow-hidden shadow-sm bg-gray-100"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />

                  {/* Route line */}
                  {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} pathOptions={{ color: "#22c55e", weight: 4 }} />
                  )}

                  {/* ✅ Delivery boy ki location */}
                  <Marker position={myLocation} icon={bikeIcon}>
                    <Popup>Aap yahan hain</Popup>
                  </Marker>

                  {/* ✅ User ki location */}
                  {activeMapOrder.address?.latitude && activeMapOrder.address?.longitude && (
                    <Marker position={[activeMapOrder.address.latitude, activeMapOrder.address.longitude]}>
                      <Popup>
                        {activeMapOrder.address.fullName}
                        <br />
                        {activeMapOrder.address.fullAddress}
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              )}
            </div>

            {/* Bottom Info */}
            <div className="px-4 py-3 border-t border-gray-100 bg-white space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{activeMapOrder.address?.fullName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} />
                    {activeMapOrder.address?.mobile}
                  </p>
                </div>
                <button
                  onClick={() => handleDelivered(activeMapOrder._id!)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                >
                  <CheckCircle size={13} />
                  Mark Delivered
                </button>
              </div>

            </div>

            {/* Floating chat toggle */}
            <button
              onClick={() => {
                if (activeMapOrder) {
                  openChatForOrder(activeMapOrder);
                }
              }}
              className="absolute bottom-20 right-4 z-50 w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
            >
              <div className="relative">
                <MessageCircle size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Chat panel (collapsible) */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 200, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="absolute left-0 right-0 bottom-0 z-40"
                >
                  <div className="mx-3 mb-3 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-lg">
                    <div className="px-3 py-2 bg-gray-50 text-[11px] text-gray-500 flex items-center justify-between">
                      <span>Chat with customer</span>
                      <button
                        onClick={() => setShowChat(false)}
                        className="text-[10px] text-gray-400"
                      >
                        Hide
                      </button>
                    </div>
                    <div
                      ref={chatScrollRef}
                      className="h-40 overflow-y-auto px-3 py-2 space-y-1 bg-white"
                    >
                    {chatMessages.length === 0 && (
                      <p className="text-[11px] text-gray-400 text-center mt-4">No messages yet</p>
                    )}
                    {chatMessages.map((m) => {
                      const mine = m.senderId === session?.user?.id;
                      return (
                        <div
                          key={m.timestamp + m.senderId}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-[11px] ${
                              mine
                                ? "bg-emerald-500 text-white rounded-br-sm"
                                : "bg-gray-100 text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            <p>{m.message}</p>
                            <p className="mt-0.5 text-[9px] opacity-75 text-right">
                              {new Date(m.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                    <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 text-xs px-2 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                      <button
                        onClick={handleSendChat}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[11px] font-semibold"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", value: activeOrders.length, icon: Bike, color: "#2563eb", glow: "rgba(37,99,235,0.08)" },
          { label: "Done", value: deliveredOrders.length, icon: CheckCircle, color: "#16a34a", glow: "rgba(22,163,74,0.08)" },
          { label: "Earned", value: `₨${Math.round(earnings)}`, icon: TrendingUp, color: "#b45309", glow: "rgba(180,83,9,0.08)" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-4"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.glow }}>
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs mt-0.5 text-gray-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Incoming Order */}
      <AnimatePresence>
        {incomingOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: -16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="incoming-card p-5 relative overflow-hidden"
          >
            <div className="shimmer" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 rounded-full bg-green-500"
                />
                <span className="text-green-700 text-xs font-bold tracking-widest uppercase">New Order</span>
              </div>
              <div className="relative w-11 h-11">
                <svg className="w-11 h-11 timer-svg" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(22,163,74,0.15)" strokeWidth="2.5" />
                  <motion.circle
                    cx="22" cy="22" r="18" fill="none"
                    stroke={timer > 10 ? "#16a34a" : "#dc2626"}
                    strokeWidth="2.5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 18}`}
                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - timer / 30)}`}
                    transition={{ duration: 0.8 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: timer > 10 ? "#16a34a" : "#dc2626" }}>{timer}</span>
                </div>
              </div>
            </div>

            <div className="inner-card p-3.5 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(22,163,74,0.08)" }}>
                  <MapPin size={15} className="text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-900">{incomingOrder.address?.fullName}</p>
                  <p className="text-xs mt-0.5 leading-relaxed text-gray-500">
                    {incomingOrder.address?.fullAddress}, {incomingOrder.address?.city}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Phone size={10} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{incomingOrder.address?.mobile}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="inner-card p-3 flex items-center gap-2.5">
                <Banknote size={14} className="text-gray-400" />
                <div>
                  <p className="font-bold text-sm text-gray-900">Rs. {incomingOrder.totalAmount}</p>
                  <p className="text-xs pill mt-1 w-fit" style={{
                    background: incomingOrder.paymentMethod === "cod" ? "rgba(180,83,9,0.08)" : "rgba(37,99,235,0.08)",
                    color: incomingOrder.paymentMethod === "cod" ? "#b45309" : "#2563eb",
                    padding: "2px 8px"
                  }}>
                    {incomingOrder.paymentMethod === "cod" ? "Cash" : "Paid"}
                  </p>
                </div>
              </div>
              <div className="inner-card p-3 flex items-center gap-2.5">
                <Package size={14} className="text-gray-400" />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900">{incomingOrder.items?.length} items</p>
                  <p className="text-xs truncate mt-0.5 text-gray-400">
                    {incomingOrder.items?.[0]?.name}
                    {incomingOrder.items?.length > 1 ? ` +${incomingOrder.items.length - 1}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl text-sm text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
              >
                <CheckCircle size={16} />
                {loading ? "Accepting..." : "Accept"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleReject}
                disabled={loading}
                className="w-14 flex items-center justify-center rounded-2xl"
                style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <XCircle size={18} className="text-gray-400" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!incomingOrder && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(22,163,74,0.08)" }}>
            <Bell size={16} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">Waiting for orders...</p>
            <p className="text-xs mt-0.5 text-gray-400">Naya order aate hi notification milega</p>
          </div>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="ml-auto w-2 h-2 rounded-full bg-green-500"
          />
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "#f3f4f6", border: "1px solid rgba(0,0,0,0.06)" }}>
        {(["active", "delivered"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${activeTab === tab ? "tab-active" : "tab-inactive"}`}
          >
            {tab} · {tab === "active" ? activeOrders.length : deliveredOrders.length}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3 pb-8">
        {(activeTab === "active" ? activeOrders : deliveredOrders).length === 0 ? (
          <div className="text-center py-14 text-gray-300">
            <Package size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm text-gray-400">{activeTab === "active" ? "Active order not found" : "Delivery order not found"}</p>
          </div>
        ) : (
          (activeTab === "active" ? activeOrders : deliveredOrders).map((order, i) => (
            <motion.div
              key={order._id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card card-hover p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: order.status === "delivered" ? "rgba(22,163,74,0.08)" : "rgba(37,99,235,0.08)" }}>
                    {order.status === "delivered"
                      ? <Star size={15} className="text-green-600" />
                      : <Bike size={15} className="text-blue-600" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{order.address?.fullName}</p>
                    <p className="text-xs mt-0.5 text-gray-400">{order.address?.city}</p>
                  </div>
                </div>
                <span className="pill" style={{
                  background: order.status === "delivered" ? "rgba(22,163,74,0.08)" : "rgba(37,99,235,0.08)",
                  color: order.status === "delivered" ? "#16a34a" : "#2563eb",
                }}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs mb-3 pl-12 text-gray-400">
                <MapPin size={10} />
                <span className="truncate">{order.address?.fullAddress}</span>
              </div>

              <div className="flex items-center justify-between pl-12">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Rs. {order.totalAmount}</span>
                  <span className="pill" style={{
                    background: order.paymentMethod === "cod" ? "rgba(180,83,9,0.08)" : "rgba(37,99,235,0.08)",
                    color: order.paymentMethod === "cod" ? "#b45309" : "#2563eb",
                  }}>
                    {order.paymentMethod === "cod" ? "COD" : "Paid"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* ✅ Map button — active orders pe */}
                  {order.status !== "delivered" && (
                    <button
                      onClick={() => { setActiveMapOrder(order); setShowMap(true); }}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl"
                      style={{ background: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.15)" }}
                    >
                      <MapPin size={12} />
                      Map
                    </button>
                  )}
                  {order.status !== "delivered" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelivered(order._id!)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                      style={{ background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.15)" }}
                    >
                      <CheckCircle size={12} />
                      Delivered
                      <ChevronRight size={11} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}