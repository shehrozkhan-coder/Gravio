/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { getSocket } from '@/lib/socket'
import { ArrowLeft, MapPin, Phone, User, Loader2, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false })

import L from 'leaflet'

interface Address {
  fullName: string
  mobile: string
  fullAddress: string
  city: string
  latitude: number
  longitude: number
}

interface DeliveryBoyInfo {
  name?: string
  mobile?: string
}

interface Order {
  _id: string
  status: string
  address: Address
  assignedDeliveryBoy?: DeliveryBoyInfo & { location?: { coordinates: [number, number] } }
}

interface ChatMessage {
  orderId: string
  senderId: string
  senderName: string
  senderRole: 'user' | 'deliveryBoy'
  message: string
  timestamp: number
}

export default function TrackOrderPage() {
  const params = useParams<{ orderId: string }>()
  const orderId = params?.orderId
  const { data: session } = useSession()

  const [order, setOrder] = useState<Order | null>(null)
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null)

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatOpen, setChatOpen] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const chatScrollRef = React.useRef<HTMLDivElement | null>(null)

  const bikeIcon = useMemo(
    () =>
      L.icon({
        iconUrl:
          'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6b2.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }),
    []
  )

  // Initial order + driver info
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        setLoading(true)
        const res = await axios.get('/api/user/my-orders')
        const all: Order[] = res.data?.orders || res.data || []
        const current = all.find((o) => o._id === orderId)
        if (!current) {
          setError('Order not found')
          return
        }
        setOrder(current)

        const loc = (current.assignedDeliveryBoy as any)?.location?.coordinates
        if (Array.isArray(loc) && loc.length === 2) {
          setDriverLocation([loc[1], loc[0]])
        }
      } catch (err) {
        console.error(err)
        setError('Order load nahi hua. Dobara try karein.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  // Socket live location updates + chat
  useEffect(() => {
    if (!session?.user?.id) return
    const socket = getSocket()
    socket.emit('identity', session.user.id)

    // Join chat room for this order
    if (orderId) {
      socket.emit('join-chat', { orderId })
    }

    const onLocation = (payload: { orderId: string; location: any; deliveryBoy: DeliveryBoyInfo }) => {
      if (payload.orderId !== orderId) return
      const coords = payload.location?.coordinates
      if (Array.isArray(coords) && coords.length === 2) {
        setDriverLocation([coords[1], coords[0]])
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                assignedDeliveryBoy: {
                  ...(prev.assignedDeliveryBoy || {}),
                  ...payload.deliveryBoy,
                },
              }
            : prev,
        )
      }
    }

    const onChatHistory = (payload: { orderId: string; messages: ChatMessage[] }) => {
      if (payload.orderId !== orderId) return
      console.log('📥 chat-history (user):', payload)
      setChatMessages(payload.messages || [])
      setUnreadCount(0)
    }

    const onChatMessage = (msg: ChatMessage) => {
      if (msg.orderId !== orderId) return
      console.log('📥 chat-message (user):', msg)
      setChatMessages((prev) => [...prev, msg])
      if (!chatOpen) {
        setUnreadCount((c) => c + 1)
      }
    }

    socket.on('delivery-location', onLocation)
    socket.on('chat-history', onChatHistory)
    socket.on('chat-message', onChatMessage)

    return () => {
      socket.off('delivery-location', onLocation)
      socket.off('chat-history', onChatHistory)
      socket.off('chat-message', onChatMessage)
    }
  }, [orderId, session, chatOpen])

  const center = useMemo<[number, number] | null>(() => {
    if (driverLocation) return driverLocation
    if (order?.address?.latitude && order.address.longitude) {
      return [order.address.latitude, order.address.longitude]
    }
    return null
  }, [driverLocation, order])

  // Fetch route from OSRM
  useEffect(() => {
    const fetchRoute = async () => {
      if (!driverLocation || !order?.address?.latitude || !order.address.longitude) return
      try {
        const [lat1, lon1] = driverLocation
        const lat2 = order.address.latitude
        const lon2 = order.address.longitude
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
        )
        const data = await res.json()
        const route = data.routes?.[0]
        if (!route) return
        const coords: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]])
        setRouteCoords(coords)
        const distanceKmVal = (route.distance || 0) / 1000
        const durationMinVal = (route.duration || 0) / 60
        setDistanceKm(distanceKmVal)
        setEtaMinutes(durationMinVal)
      } catch (e) {
        console.error('route error', e)
      }
    }
    fetchRoute()
  }, [driverLocation, order])

  const handleSendChat = () => {
    if (!orderId || !session?.user?.id || !chatInput.trim()) return
    const socket = getSocket()
    const msg: ChatMessage = {
      orderId,
      senderId: session.user.id,
      senderName: session.user.name || 'You',
      senderRole: 'user',
      message: chatInput.trim(),
      timestamp: Date.now(),
    }
    console.log('📤 sending chat-message (user):', msg)
    socket.emit('chat-message', msg)
    setChatInput('')
  }

  // Auto scroll chat to latest
  React.useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages, chatOpen])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-green-600 mb-2" />
        <p className="text-sm">Order track ho raha hai...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 px-4 text-center">
        <p className="text-sm mb-3">{error || 'Order not found'}</p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-3 bg-white border-b border-gray-100">
        <button
          onClick={() => window.history.back()}
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-all duration-150"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-green-700" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">Track Order</h1>
          <p className="text-xs text-gray-400">Order #{order._id.slice(-6).toUpperCase()}</p>
          {distanceKm != null && etaMinutes != null && (
            <p className="text-[11px] text-gray-400">
              Approx {distanceKm.toFixed(1)} km · {Math.round(etaMinutes)} min
            </p>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="bg-gray-200 px-4 pt-3">
        {center && (
          <MapContainer
            center={center}
            zoom={13}
            className="w-full h-64 max-h-72 rounded-2xl overflow-hidden shadow-sm bg-gray-100"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Route */}
            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} pathOptions={{ color: '#22c55e', weight: 4 }} />
            )}

            {/* Customer location */}
            {order.address?.latitude && order.address?.longitude && (
              <Marker position={[order.address.latitude, order.address.longitude]}>
                <Popup>
                  Aap ka ghar
                  <br />
                  {order.address.fullAddress}, {order.address.city}
                </Popup>
              </Marker>
            )}

            {/* Delivery boy live location */}
            {driverLocation && (
              <Marker position={driverLocation} icon={bikeIcon}>
                <Popup>Delivery boy yahan hai</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </div>

      {/* Bottom sheet with info + chat */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-3 overflow-y-auto">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <User size={16} className="text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-400 mb-0.5">Delivery Boy</p>
            <p className="text-sm font-bold text-gray-900">
              {order.assignedDeliveryBoy?.name || 'Assign ho raha hai...'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Phone size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {order.assignedDeliveryBoy?.mobile || 'Number abhi available nahi'}
              </span>
            </div>
          </div>
          {order.assignedDeliveryBoy?.mobile && (
            <a
              href={`tel:${order.assignedDeliveryBoy.mobile}`}
              className="px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold"
            >
              Call
            </a>
          )}
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
            <MapPin size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-0.5">Your Address</p>
            <p className="text-sm font-medium text-gray-900">{order.address.fullName}</p>
            <p className="text-xs text-gray-500">
              {order.address.fullAddress}, {order.address.city}
            </p>
            <p className="text-xs text-gray-400 mt-1">Status: {order.status}</p>
          </div>
        </div>

        {/* Chat toggle + panel */}
        <div className="relative">
          <button
            onClick={() => {
              setChatOpen((prev) => !prev)
              if (!chatOpen) setUnreadCount(0)
            }}
            className="absolute -top-6 right-0 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"
          >
            <div className="relative">
              <MessageCircle size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-[9px] font-semibold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="mt-4 border border-gray-100 rounded-2xl overflow-hidden"
              >
                <div className="px-3 py-2 bg-gray-50 text-[11px] text-gray-500 flex items-center gap-1">
                  <MessageCircle size={12} className="text-emerald-500" />
                  <span>Chat with {order.assignedDeliveryBoy?.name || 'delivery boy'}</span>
                </div>
                <div
                  ref={chatScrollRef}
                  className="h-40 overflow-y-auto px-3 py-2 space-y-1 bg-white"
                >
                  {chatMessages.length === 0 && (
                    <p className="text-[11px] text-gray-400 text-center mt-4">No messages yet</p>
                  )}
                  {chatMessages.map((m) => {
                    const mine = m.senderId === session?.user?.id
                    return (
                      <div
                        key={m.timestamp + m.senderId}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-[11px] ${
                            mine
                              ? 'bg-emerald-500 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="font-semibold text-[10px] mb-0.5">
                            {mine ? 'You' : m.senderName}
                          </p>
                          <p>{m.message}</p>
                          <p className="mt-0.5 text-[9px] opacity-75 text-right">
                            {new Date(m.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
