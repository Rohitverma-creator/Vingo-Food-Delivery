import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { TbLocationFilled } from "react-icons/tb";
import { serverUrl } from "../App";
import axios from "axios";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ClipLoader } from "react-spinners";

const DeliveryBoy = () => {
  const { userData, socket } = useSelector((state) => state.user);

  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState({});
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [otp, setOtp] = useState("");
  const [message,setMessage]=useState("")
  const navigate = useNavigate();
  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setDeliveryBoyLocation({
            lat: latitude,
            lon: longitude,
          });

          socket.emit("updateLocation", {
            latitude,
            longitude,
            userId: userData._id,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
        },
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [socket, userData]);

  const getAssignment = async () => {
    if (!userData?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/order/get-assignments`, {
        withCredentials: true,
      });
      setAvailableAssignments(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (id) => {
    try {
      await axios.get(`${serverUrl}/api/order/accept-order/${id}`, {
        withCredentials: true,
      });
      getCurrentOrder();
    } catch (err) {
      console.log(err);
    }
  };
  const sendOtp = async (shopOrderId) => {
    setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/send-delivery-otp`,
        {
          orderId: currentOrder._id,
          shopOrderId: shopOrderId,
        },
        { withCredentials: true },
      );
      setLoading(false)

      setShowOtpBox(true);
      setMessage(result.data.message)
    } catch (err) {
      console.log(err.response?.data || err);
      setLoading(false)
    }
  };

  const verifyOtp = async () => {
    setMessage("")
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/verify-delivery-otp`,
        {
          orderId: currentOrder?._id,
          shopOrderId: currentOrder?.shopOrder?._id,
          otp,
        },
        { withCredentials: true },
      );

      console.log(result.data);
      navigate("/order-delivered");
    } catch (err) {
      console.log("OTP ERROR:", err.response?.data || err);
    }
  };

  const handleTodayDeliveries = async () => {
    const result = await axios.get(
      `${serverUrl}/api/order/get-today-deliveries`,
      {
        withCredentials: true,
      },
    );
    console.log(result.data);
    setTodayDeliveries(result.data.stats);
  };

  useEffect(() => {
    socket?.on("newAssignment", (data) => {
      if (data.sentTo == userData._id) {
        setAvailableAssignments((prev) => [...prev, data]);
      }
    });
    return () => {
      socket?.off("newAssignment");
    };
  }, [socket]);

  const getCurrentOrder = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/order/get-current-order`, {
        withCredentials: true,
      });
      setCurrentOrder(res.data || null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAssignment();
    getCurrentOrder();
    handleTodayDeliveries();
  }, [userData]);

  const ratePerDelivery = 50;
 const totalEarning = todayDeliveries.reduce(
    (sum, d) => sum + d.count * ratePerDelivery,
    0,
  );

  return (
    <div className="w-screen min-h-screen flex flex-col items-center bg-[#fff9f6]">
      <Nav />

      {/* PROFILE */}
      <div className="w-full max-w-[760px] px-3 mt-3">
        <div className="bg-white rounded-lg p-3 border border-orange-100 flex justify-between">
          <div>
            <h1 className="text-sm font-semibold text-[#ff4d2d]">
              {userData?.fullName}
            </h1>
            <p className="text-[11px] text-gray-500">Ready for delivery 🚴‍♂️</p>
          </div>

          {userData?.location && (
            <div className="bg-[#fff9f6] px-2 py-1 rounded-md border border-orange-100">
              <div className="flex items-center gap-1 text-[11px] text-[#ff4d2d] font-semibold">
                <TbLocationFilled size={12} />
                Location
              </div>
              <div className="flex gap-1 mt-1 text-[10px]">
                <span className="px-2 py-0.5 rounded bg-[#ff4d2d]/10 text-[#ff4d2d]">
                  {userData.location.coordinates[1]}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#ff4d2d]/10 text-[#ff4d2d]">
                  {userData.location.coordinates[0]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mt-3 mb-6 border border-orange-100 ">
        <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">
          Today Deliveries
        </h1>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={todayDeliveries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
            <YAxis allowDecimals={false} />
            <Tooltip
              formatter={(value) => [value, "orders"]}
              labelFormatter={(label) => `${label}:00`}
            />
            <Bar dataKey="count" fill="#ff4d2d" />
          </BarChart>
        </ResponsiveContainer>
        <div className="bg-white shadow-md rounded-xl p-5 border border-orange-100">
          <h1 className="text-sm text-gray-500 font-medium">Today's Earning</h1>
          <span className="text-2xl font-bold text-[#ff4d2d]">
            ₹{totalEarning}
          </span>
        </div>
      </div>

      {/* AVAILABLE ORDERS */}
      {!currentOrder && (
        <div className="w-full max-w-[760px] px-3 mt-4">
          <div className="bg-white rounded-lg p-3 border border-orange-100">
            <h2 className="text-sm font-semibold text-[#ff4d2d] mb-2">
              Available Orders
            </h2>

            {loading && (
              <p className="text-center text-[11px] text-gray-400">
                Loading...
              </p>
            )}

            {!loading && availableAssignments.length > 0 && (
              <div className="space-y-2">
                {availableAssignments.map((a, i) => (
                  <div
                    key={a.assignmentId || i}
                    className="p-2 rounded-md border border-orange-100 bg-[#fff9f6]"
                  >
                    <p className="text-[12px] font-medium text-gray-700">
                      {a.shopName}
                    </p>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {a.deliveryAddress?.text}
                    </p>

                    <div className="flex justify-between items-center mt-1 text-[11px]">
                      <span>
                        {a.items?.length || 0} items • ₹{a.subTotal}
                      </span>
                      <button
                        onClick={() => acceptOrder(a.assignmentId)}
                        className="px-3 py-1 rounded bg-green-500 text-white text-[11px]"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && availableAssignments.length === 0 && (
              <p className="text-center text-[11px] text-gray-400 py-4">
                No orders right now
              </p>
            )}
          </div>
        </div>
      )}

      {/* CURRENT ORDER */}
      {currentOrder && (
        <div className="w-full max-w-[760px] px-3 mt-4">
          <div className="bg-white rounded-lg p-3 border border-orange-100">
            <h2 className="text-sm font-semibold text-[#ff4d2d] mb-1">
              📦 Current Order
            </h2>

            <div className="bg-[#fff9f6] rounded-md p-2 border border-orange-100">
              <p className="text-[12px] font-medium">
                {currentOrder?.shopOrder?.shop?.name}
              </p>
              <p className="text-[11px] text-gray-600 line-clamp-1">
                {currentOrder?.deliveryAddress?.text}
              </p>
              <p className="text-[11px] flex gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-[#ff4d2d]/10 text-[#ff4d2d]">
                  {currentOrder?.shopOrder?.shopOrderItems?.length || 0} items
                </span>
                <span className="font-semibold text-green-600">
                  ₹{currentOrder?.shopOrder?.subTotal}
                </span>
              </p>
            </div>

            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: deliveryBoyLocation || {
                  lat: userData.location.coordinates[1],
                  lon: userData.location.coordinates[0],
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude,
                },
              }}
            />

            {!showOtpBox ? (
              <button disabled={loading}
                onClick={() => sendOtp(currentOrder.shopOrder._id)}
                className="mt-3 w-full rounded-lg px-3 py-2 text-[12px] font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600"
              >
               {loading ? <ClipLoader size={20} color='white'/> :" Mark As Delivered"}
              </button>
            ) : (
              <div className="mt-3 p-3 rounded-lg bg-gray-50 border">
                <p className="text-[12px] text-purple-700">
                  Enter OTP sent to
                  <span className="ml-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                    {currentOrder?.user?.fullName}
                  </span>
                </p>

                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  placeholder="Enter OTP"
                  className="mt-2 w-full px-3 py-2 text-[12px] rounded-lg border focus:border-purple-500 outline-none"
                />
                   {message && <p className="text-[11px] text-red-500 mt-1">{message}</p>}

                <button
                  onClick={verifyOtp}
                  className="mt-3 w-full rounded-lg px-3 py-2 text-[12px] font-semibold border border-purple-500 text-purple-700 hover:bg-purple-600 hover:text-white"
                >
                  Submit OTP
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoy;
