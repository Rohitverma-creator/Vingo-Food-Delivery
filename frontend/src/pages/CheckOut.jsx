import React, { useEffect, useState } from "react";
import { IoArrowBack, IoSearchOutline } from "react-icons/io5";
import { FaLocationDot } from "react-icons/fa6";
import { TbCurrentLocation } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { setLocation, setAddress } from "../redux/mapSlice";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileAlt, FaRegCreditCard } from "react-icons/fa";
import { serverUrl } from "../App";
import { addMyOrder } from "../redux/userSlice";

function RecenterMap({ location }) {
  const map = useMap();

  useEffect(() => {
    if (
      typeof location?.lat === "number" &&
      typeof location?.lon === "number"
    ) {
      map.setView([location.lat, location.lon], 15, { animate: true });
    }
  }, [location, map]);

  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.map);
  const userData = useSelector((state) => state.user);
  const cartItems = useSelector((state) => state.user.cartItems);
  const totalAmount = useSelector((state) => state.user.totalAmount);
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const apiKey = import.meta.env.VITE_GEOAPIKEY;

  const deliveryFee = totalAmount > 500 ? 0 : 40;
  const AmountWithDeliveryFee = totalAmount + deliveryFee;
  const openRazorPayWindow = (orderId, razorOrder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razorOrder?.amount,
      currency: "INR",
      name: "Vingo",
      description: "Food delivery website",
      order_id: razorOrder?.id,
      handler: async function (response) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/order/verify-payment`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              orderId,
            },
            { withCredentials: true },
          );
          dispatch(addMyOrder(result.data));
          navigate("/order-placed");
        } catch (error) {
          console.log(error);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text: addressInput,
            latitude: location.lat,
            longitude: location.lon,
          },
          totalAmount:AmountWithDeliveryFee,
          cartItems,
        },
        { withCredentials: true },
      );
      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data));
        navigate("/order-placed");
      } else {
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorPayWindow(orderId, razorOrder);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const reverseGeocode = async (lat, lon) => {
    const res = await axios.get("https://api.geoapify.com/v1/geocode/reverse", {
      params: { lat, lon, format: "json", apiKey },
    });
    dispatch(setAddress(res.data.results?.[0]?.formatted || ""));
  };

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lon: lng }));
    reverseGeocode(lat, lng);
  };

  const getLatLangByAddress = async () => {
    const res = await axios.get("https://api.geoapify.com/v1/geocode/search", {
      params: { text: addressInput, format: "json", limit: 1, apiKey },
    });
    const data = res.data.results?.[0];
    if (!data) return;
    dispatch(setLocation({ lat: data.lat, lon: data.lon }));
    dispatch(setAddress(data.formatted));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        dispatch(setLocation({ lat: latitude, lon: longitude }));
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Location permission denied or error occurred");
      },
    );
  };

  useEffect(() => {
    setAddressInput(address || "");
  }, [address]);

  if (typeof location?.lat !== "number" || typeof location?.lon !== "number") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fff4f6] flex justify-center px-2 py-4">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-lg p-3 space-y-4">
        <button
          onClick={() => navigate("/")}
          className="absolute top-3 left-3 text-[#ff4d2d]"
        >
          <IoArrowBack size={22} />
        </button>

        <h1 className="text-lg font-semibold text-center">CheckOut</h1>

        <section>
          <h2 className="text-sm font-semibold mb-1 flex items-center gap-1 text-gray-800">
            <FaLocationDot className="text-[#ff4d2d]" />
            Delivery Location
          </h2>

          <div className="flex gap-2 mb-2">
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              type="text"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full"
              placeholder="Enter delivery address"
            />
            <button
              onClick={getLatLangByAddress}
              className="p-1.5 rounded-full bg-[#ff4d2d] text-white"
            >
              <IoSearchOutline size={16} />
            </button>
            <button
              onClick={getCurrentLocation}
              className="p-1.5 rounded-full bg-blue-500 text-white"
            >
              <TbCurrentLocation size={16} />
            </button>
          </div>

          <div className="rounded-lg border overflow-hidden h-40">
            <MapContainer
              className="w-full h-full"
              center={[location.lat, location.lon]}
              zoom={13}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap location={location} />
              <Marker
                position={[location.lat, location.lon]}
                draggable
                eventHandlers={{ dragend: onDragEnd }}
              />
            </MapContainer>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-2 text-gray-800">
            Payment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer ${
                paymentMethod === "cod" ? "border-[#ff4d2d]" : "border-gray-300"
              }`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <MdDeliveryDining size={18} className="text-green-600" />
              </span>
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-[11px] text-gray-500">Pay on delivery</p>
              </div>
            </div>

            <div
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center gap-2 p-3 border rounded-md cursor-pointer ${
                paymentMethod === "online"
                  ? "border-[#ff4d2d]"
                  : "border-gray-300"
              }`}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <FaMobileAlt size={16} className="text-blue-600" />
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <FaRegCreditCard size={16} className="text-red-600" />
              </span>
              <div>
                <p className="text-sm font-medium">UPI / Card</p>
                <p className="text-[11px] text-gray-500">Online payment</p>
              </div>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            {cartItems.map((item) => (
              <div
                key={item}
                className="flex justify-between text-sm text-gray-700"
              >
                <span>
                  {item.name} X {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <hr className="border-gray-200 my-2" />
            <div className="flex justify-between font-medium text-gray-800">
              <span>Subtotal</span>
              <span className="float-right font-medium">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "Free" : deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-[#ff4d2d] pt-2">
              <span>Total Amount</span>
              <span>₹{AmountWithDeliveryFee}</span>
            </div>
          </div>
        </section>
        <button
          onClick={handlePlaceOrder}
          className="relative w-full mt-4 py-3 rounded-xl font-semibold text-white text-sm
             bg-gradient-to-r from-[#ff4d2d] to-orange-500 overflow-hidden
             before:absolute before:inset-0
             before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
             before:-translate-x-full hover:before:translate-x-full
             before:transition-transform before:duration-700
             shadow-lg hover:shadow-orange-400/50
             active:scale-95 transition-all"
        >
          {paymentMethod === "cod" ? "Place Order" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckOut;
