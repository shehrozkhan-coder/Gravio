"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { User, Phone, Package, MapPin, Clock, ShoppingBag, Banknote, CreditCard } from "lucide-react";

interface IncomingOrder {
  order: {
    _id: string;
    totalAmount: number;
    paymentMethod: "cod" | "online";
    status: string;
    createdAt: string;
    address: {
      fullName: string;
      fullAddress: string;
      city: string;
      mobile: string;
    };
    items: { name: string; quantity: number; price: string }[];
  };
  user: {
    name: string;
    mobile: string;
  };
}

interface AssignmentNotification {
  deliveryBoy: {
    name: string;
    mobile: string;
  };
  order: {
    _id: string;
    totalAmount: number;
    address: {
      fullName: string;
      fullAddress: string;
      city: string;
    };
  };
  acceptedAt: string;
}

interface AnalyticsData {
  ordersPerDay: { date: string; count: number }[];
  revenuePerDay: { date: string; amount: number }[];
  statusCounts: Record<string, number>;
  totals: {
    totalOrders: number;
    totalRevenue: number;
    totalDeliveryBoys: number;
    totalUsers: number;
  };
}

const STATUS_COLORS: string[] = ["#22c55e", "#3b82f6", "#f97316", "#ef4444", "#a855f7", "#06b6d4"];

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [newOrders, setNewOrders] = useState<IncomingOrder[]>([]);
  const [assignments, setAssignments] = useState<AssignmentNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "assignments">("orders");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const s: Socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER!, {
      transports: ["websocket"],
    });

    s.emit("identity", session.user.id);

    s.on("new-order-for-admin", (data: IncomingOrder) => {
      setNewOrders((prev) => [data, ...prev]);
    });

    s.on("delivery-boy-assigned", (data: AssignmentNotification) => {
      setAssignments((prev) => [data, ...prev]);
    });

    return () => {
      s.disconnect();
    };
  }, [session]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await axios.get<AnalyticsData>("/api/admin/analytics");
        setAnalytics(res.data);
      } catch (error) {
        console.error("analytics error", error);
      }
    };
    loadAnalytics();
  }, []);

  const statusData =
    analytics &&
    Object.entries(analytics.statusCounts).map(([name, value]) => ({
      name,
      value,
    }));

  const recentActivity = useMemo(
    () => newOrders.slice(0, 5),
    [newOrders],
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6 mt-20" style={{ fontFamily: "'Syne', sans-serif" }}>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>

      {/* Analytics Section */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Stat cards - glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 cursor-pointer">
            {[
              {
                label: "Total Orders",
                value: analytics.totals.totalOrders,
                color: "#3b82f6",
                change: "+12%",
              },
              {
                label: "Revenue",
                value: analytics.totals.totalRevenue,
                color: "#22c55e",
                change: "+8%",
                isCurrency: true,
              },
              {
                label: "Delivery Boys",
                value: analytics.totals.totalDeliveryBoys,
                color: "#a855f7",
                change: "+3%",
              },
              {
                label: "Users",
                value: analytics.totals.totalUsers,
                color: "#f97316",
                change: "+5%",
              },
            ].map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
                whileHover={{ y: -4, boxShadow: "0 18px 30px rgba(15,23,42,0.16)" }}
                className="relative rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl px-4 py-3 shadow-sm overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-white/40 via-white/5 to-transparent pointer-events-none" />
                <div className="relative flex flex-col gap-1">
                  <p className="text-[11px] text-gray-500 font-semibold">{card.label}</p>
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="text-lg font-bold text-slate-900"
                    style={{ color: card.color }}
                  >
                    {card.isCurrency ? `₨${card.value.toLocaleString()}` : card.value.toLocaleString()}
                  </motion.p>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span
                      className="font-semibold"
                      style={{ color: card.change.startsWith("+") ? "#16a34a" : "#dc2626" }}
                    >
                      {card.change}
                    </span>
                    <span className="text-gray-400">vs last week</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Revenue line chart - full width */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">Revenue Overview</p>
                <p className="text-[11px] text-gray-400">Last 7 days</p>
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenuePerDay}>
                  <defs>
                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(raw: number | string | undefined) => {
                      const value = typeof raw === "number" ? raw : Number(raw || 0);
                      return [`₨${value.toLocaleString()}`, "Revenue"];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#22c55e"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    activeDot={{ r: 4 }}
                    fill="url(#revGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Orders + Status charts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Orders bar */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <p className="text-xs font-semibold text-gray-500 mb-2">Daily Orders</p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.ordersPerDay}>
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="url(#ordersGradient)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Status donut */}
            {statusData && statusData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
              >
                <p className="text-xs font-semibold text-gray-500 mb-2">Orders by Status</p>
                <div className="flex items-center gap-4">
                  <div className="h-40 w-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={4}
                          strokeWidth={1}
                        >
                          {statusData.map((_, idx) => (
                            <Cell key={idx} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] text-gray-400">Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {analytics.totals.totalOrders}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    {statusData.map((s, idx) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[idx % STATUS_COLORS.length] }}
                        />
                        <span className="text-gray-600">
                          {s.name} – {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Live activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-xs font-semibold text-gray-600">Live Activity</p>
              </div>
              <p className="text-[11px] text-gray-400">
                Last {recentActivity.length} orders
              </p>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-[12px] text-gray-400">No recent activity yet.</p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {recentActivity.map((n, idx) => (
                    <motion.div
                      key={n.order._id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[11px] font-semibold text-gray-800">
                          #{n.order._id.slice(-6).toUpperCase()} · {n.user.name}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          Rs. {n.order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(n.order.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                          {n.order.status ?? "pending"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Real-time panels */}
      <div>
        {/* Tabs */}
        <div
          className="flex gap-2 p-1 rounded-2xl mb-5"
          style={{ background: "#f3f4f6", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "orders" ? "bg-gray-800 text-white" : "text-gray-400"
            }`}
          >
            New Orders · {newOrders.length}
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === "assignments" ? "bg-gray-800 text-white" : "text-gray-400"
            }`}
          >
            Assigned · {assignments.length}
          </button>
        </div>

        {/* New Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {newOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No Order Found</p>
              </div>
            ) : (
              <AnimatePresence>
                {newOrders.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-widest">Naya Order</span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(n.order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-blue-400 font-semibold mb-1">Customer</p>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-blue-600" />
                        <span className="font-bold text-sm text-gray-900">{n.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone size={14} className="text-blue-600" />
                        <span className="text-xs text-gray-500">{n.user.mobile}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Order Detail</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-500" />
                          <span className="text-sm font-bold text-gray-900">Rs. {n.order.totalAmount}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${n.order.paymentMethod === "online" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                          {n.order.paymentMethod === "online" ? <CreditCard size={10} /> : <Banknote size={10} />}
                          {n.order.paymentMethod === "online" ? "Online" : "COD"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{n.order.address?.fullAddress}, {n.order.address?.city}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-semibold mb-2">Items ({n.order.items.length})</p>
                      {n.order.items.map((item, j) => (
                        <div key={j} className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{item.name} x{item.quantity}</span>
                          <span>Rs. {item.price}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Koi assignment notification nahi abhi</p>
              </div>
            ) : (
              <AnimatePresence>
                {assignments.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Order Assigned</span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(n.acceptedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-blue-400 font-semibold mb-1">Delivery Boy</p>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-blue-600" />
                        <span className="font-bold text-sm text-gray-900">{n.deliveryBoy.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone size={14} className="text-blue-600" />
                        <span className="text-xs text-gray-500">{n.deliveryBoy.mobile}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Order Info</p>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-gray-500" />
                        <span className="text-sm font-bold text-gray-900">Rs. {n.order.totalAmount}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{n.order.address?.fullAddress}, {n.order.address?.city}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div> {/* ✅ Real-time panels div close */}
    </div>
  );
}