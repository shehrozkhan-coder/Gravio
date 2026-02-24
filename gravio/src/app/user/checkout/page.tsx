"use client";

import {
  ArrowLeft,
  Building,
  CreditCard,
  Home,
  MapPin,
  Navigation,
  Phone,
  Search,
  Truck,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { clearCart } from "@/redux/cartSlice";
import { persistor } from "@/redux/store";

const MapViewDynamic = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
      Map is Loading...
    </div>
  ),
});

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);
  const { cartData } = useSelector((state: RootState) => state.cart);
  const subTotal = cartData.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);
  const deliveryFee = cartData.length === 0 ? 0 : subTotal >= 300 ? 0 : 50;
  const finalTotal = subTotal + deliveryFee;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const mapControlRef = useRef<{ flyTo: (lat: number, lng: number) => void } | null>(null);

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => { console.log("Location error", err); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const result = await axios.get(`/api/geocode?lat=${position[0]}&lon=${position[1]}`);
        const addr = result.data.address;
        setAddress((prev) => ({
          ...prev,
          fullAddress: result.data.display_name || prev.fullAddress,
          city: addr.city || addr.town || addr.village || addr.county || prev.city,
          state: addr.state || prev.state,
          pincode: addr.postcode || prev.pincode,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAddress();
  }, [position]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await axios.get(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      const data = Array.isArray(res.data) ? res.data : [res.data];
      if (data.length > 0 && data[0].lat) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        mapControlRef.current?.flyTo(lat, lng);
      } else {
        alert("Location not found, please try again.");
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      setAddress((prev) => ({
        ...prev,
        fullName: userData.name || "",
        mobile: userData.mobile || "",
      }));
    }
  }, [userData]);

  const buildOrderPayload = (method: "cod" | "online") => {
    const items = cartData.map((item) => ({
      grocery: item._id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      image: item.image,
      quantity: item.quantity,
    }));

    return {
      userId: userData?._id,
      items,
      totalAmount: finalTotal.toString(),
      paymentMethod: method,
      address: {
        ...address,
        latitude: position?.[0] ?? 0,
        longitude: position?.[1] ?? 0,
      },
    };
  };

  const handleCod = async () => {
    if (!address.fullName || !address.mobile || !address.fullAddress || !address.city || !address.state || !address.pincode) {
      alert("Make sure your address will be filled");
      return;
    }

    setOrderLoading(true);
    try {
      const result = await axios.post("/api/user/order", buildOrderPayload("cod"));

      if (result.status === 200 || result.status === 201) {
        dispatch(clearCart());
        await persistor.purge(); // ✅ localStorage bhi clear
        router.push("/user/order-success");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Order place nahi hua. Dobara try karo.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!address.fullName || !address.mobile || !address.fullAddress || !address.city || !address.state || !address.pincode) {
      alert("Make sure your address will be filled");
      return;
    }

    setOrderLoading(true);
    try {
      const result = await axios.post("/api/user/payment", buildOrderPayload("online"));

      if (result.data?.url) {
        dispatch(clearCart());
        await persistor.purge(); // ✅ localStorage bhi clear
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initiate nahi hua. Dobara try karo.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="w-[92%] md:w-[80%] mx-auto py-10 relative">
      <button
        className="absolute left-0 top-2 flex items-center gap-2 text-green-700 hover:text-green-800 font-semibold transition"
        onClick={() => router.push("/user/cart")}
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Back to Cart</span>
      </button>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-10"
      >
        Checkout
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-700" /> Delivery Address
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-green-600" size={18} />
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => setAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                placeholder="Full Name"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3 text-green-600" size={18} />
              <input
                type="text"
                value={address.mobile}
                onChange={(e) => setAddress((prev) => ({ ...prev, mobile: e.target.value }))}
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                placeholder="Mobile Number"
              />
            </div>

            <div className="relative">
              <Home className="absolute left-3 top-3 text-green-600" size={18} />
              <input
                type="text"
                value={address.fullAddress}
                placeholder="Full Address"
                onChange={(e) => setAddress((prev) => ({ ...prev, fullAddress: e.target.value }))}
                className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Building className="absolute left-3 top-3 text-green-600" size={18} />
                <input
                  type="text"
                  value={address.city}
                  placeholder="City"
                  onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>

              <div className="relative">
                <Navigation className="absolute left-3 top-3 text-green-600" size={18} />
                <input
                  type="text"
                  value={address.state}
                  placeholder="State"
                  onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 text-green-600" size={18} />
                <input
                  type="text"
                  value={address.pincode}
                  placeholder="PinCode"
                  onChange={(e) => setAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                  className="pl-10 w-full border rounded-lg p-3 text-sm bg-gray-50"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search city or area..."
                className="flex-1 border rounded-lg p-3 text-sm focus:ring-green-500 outline-none"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-green-600 text-white px-5 rounded-lg hover:bg-green-700 transition-all font-medium disabled:opacity-60"
              >
                {searchLoading ? "..." : "Search"}
              </button>
            </div>

            <div className="relative mt-6 h-[330px] rounded-xl overflow-hidden border border-gray-200 shadow-inner">
              <MapViewDynamic
                position={position}
                onPositionChange={(lat, lng) => setPosition([lat, lng])}
                mapControlRef={mapControlRef}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-fit"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="text-green-600" /> Payment Method
          </h2>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all cursor-pointer ${
                paymentMethod === "online"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <CreditCard />
              <span className="font-medium text-gray-700">Pay Online (Stripe)</span>
            </button>

            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center gap-3 w-full border rounded-lg p-3 transition-all cursor-pointer ${
                paymentMethod === "cod"
                  ? "border-green-600 bg-green-50 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
            >
              <Truck />
              <span className="font-medium text-gray-700">Cash on Delivery</span>
            </button>
          </div>

          <div className="border-t pt-4 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rs {subTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                {deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base text-green-700 border-t pt-3">
              <span>Total</span>
              <span>Rs {finalTotal}</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={orderLoading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-full hover:bg-green-700 transition-all font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              if (paymentMethod === "cod") {
                handleCod();
              } else {
                handleOnlinePayment();
              }
            }}
          >
            {orderLoading
              ? "Please wait..."
              : paymentMethod === "cod"
              ? "Place Order"
              : "Pay & Place Order"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;