'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Clock, CheckCircle, Truck, XCircle,
  RefreshCw, ShoppingBag, ChevronDown, ChevronUp,
  CreditCard, Banknote, Users
} from 'lucide-react'

interface OrderItem {
  name: string
  quantity: number
  price: number
  image?: string
  unit?: string
}

interface Order {
  _id: string
  createdAt: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  items: OrderItem[]
  paymentMethod?: 'cod' | 'online'
  address?: {
    fullName: string
    mobile: string
    city: string
    fullAddress: string
  }
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  processing: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-400' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400' },
}

const ALL_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
type StatusType = typeof ALL_STATUSES[number]

const STATUS_OPTIONS: StatusType[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: string, status: StatusType) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  const date = new Date(order.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const handleStatusChange = async (newStatus: StatusType) => {
    setUpdating(true)
    try {
      await axios.patch(`/api/admin/update-order/${order._id}`, { status: newStatus })
      onStatusChange(order._id, newStatus)
    } catch (error) {
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Order ID</p>
          <p className="text-sm font-semibold text-gray-700 font-mono mt-0.5">#{order._id.slice(-8).toUpperCase()}</p>
          <p className="text-xs text-gray-400 mt-1">{date}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Payment Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            order.paymentMethod === 'online'
              ? 'bg-blue-50 text-blue-600 border border-blue-100'
              : 'bg-gray-50 text-gray-500 border border-gray-100'
          }`}>
            {order.paymentMethod === 'online' ? <><CreditCard size={11} /> Online</> : <><Banknote size={11} /> COD</>}
          </div>
          <p className="text-sm font-bold text-green-700">Rs. {Number(order.totalAmount).toLocaleString()}</p>
        </div>
      </div>

      {/* Customer Info */}
      {order.address && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <Users size={13} className="text-gray-400" />
          <span className="text-xs text-gray-600 font-medium">{order.address.fullName}</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-400">{order.address.mobile}</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-400">{order.address.city}</span>
        </div>
      )}

      {/* Items Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs text-gray-500 font-medium">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </span>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-7 h-7 object-contain rounded-lg" />
                        : <ShoppingBag size={16} className="text-gray-300" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} {item.unit && `• ${item.unit}`}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer — Status + Dropdown */}
      <div className={`flex items-center justify-between px-5 py-3 ${status.bg} border-t ${status.border}`}>
        <div className={`flex items-center gap-2 ${status.color}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot} ${order.status === 'pending' ? 'animate-pulse' : ''}`} />
          <StatusIcon size={14} />
          <span className="text-xs font-semibold">{status.label}</span>
        </div>

        {/* Status Updater */}
        <div className="flex items-center gap-2">
          {updating && <RefreshCw size={13} className="animate-spin text-gray-400" />}
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as StatusType)}
            disabled={updating}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="flex justify-between px-5 py-4 border-b border-gray-50">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-100 rounded-full" />
          <div className="h-4 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-2 flex flex-col items-end">
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-4 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="h-3 w-48 bg-gray-100 rounded-full" />
      </div>
      <div className="px-5 py-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-xl" />
              <div className="space-y-1">
                <div className="h-3 w-28 bg-gray-100 rounded-full" />
                <div className="h-2 w-12 bg-gray-100 rounded-full" />
              </div>
            </div>
            <div className="h-3 w-16 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="h-3 w-20 bg-gray-100 rounded-full" />
        <div className="h-6 w-28 bg-gray-100 rounded-lg" />
      </div>
    </div>
  )
}

const TABS = ['All', ...ALL_STATUSES] as const
type TabType = typeof TABS[number]

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('All')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await axios.get('/api/admin/get-orders')
      setOrders(result.data?.orders || result.data || [])
    } catch (error) {
      console.error(error)
      setError('Orders load nahi hue. Dobara try karein.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = (id: string, newStatus: StatusType) => {
    setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: newStatus } : o))
  }

  const filtered = activeTab === 'All' ? orders : orders.filter((o) => o.status === activeTab)

  const tabColors: Record<TabType, string> = {
    All: 'bg-gray-800 text-white',
    pending: 'bg-amber-400 text-white',
    processing: 'bg-blue-500 text-white',
    shipped: 'bg-purple-500 text-white',
    delivered: 'bg-emerald-500 text-white',
    cancelled: 'bg-red-400 text-white',
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen w-full">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 w-full backdrop-blur-xl bg-white/80 shadow-sm border-b border-gray-100 z-50">
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Manage Orders</h1>
              {!loading && !error && (
                <p className="text-xs text-gray-400">{orders.length} total orders</p>
              )}
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-semibold text-gray-600 transition"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeTab === tab ? tabColors[tab] : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {tab === 'All' ? 'All' : statusConfig[tab].label}
                {tab !== 'All' && (
                  <span className="ml-1 opacity-70">({orders.filter((o) => o.status === tab).length})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pt-36 pb-12 space-y-4">
        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-5 text-sm">
            <div className="flex items-center gap-2">
              <XCircle size={18} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-full text-xs font-semibold transition"
            >
              <RefreshCw size={13} /> Dobara Try Karein
            </button>
          </div>
        )}

        {/* Skeletons */}
        {loading && !error && [1, 2, 3].map((i) => <SkeletonCard key={i} />)}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-100 flex items-center justify-center mb-5">
              <ShoppingBag size={36} className="text-green-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Koi order nahi mila</h3>
            <p className="text-sm text-gray-400">Is category mein abhi koi order nahi hai.</p>
          </div>
        )}

        {/* Orders */}
        <AnimatePresence mode="popLayout">
          {!loading && !error && filtered.map((order) => (
            <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ManageOrders