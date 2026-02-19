import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { IoIosArrowBack } from "react-icons/io";
import "leaflet/dist/leaflet.css";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

const TrackOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSelector((state) => state.user);

  const [currentOrder, setCurrentOrder] = useState(null);
  const [liveLocation, setLiveLocation] = useState({});

  // ✅ SOCKET LISTENER
  useEffect(() => {
    if (!socket) return;

    const handler = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocation((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude },
      }));
    };

    socket.on("updateDeliveryLocation", handler);

    return () => {
      socket.off("updateDeliveryLocation", handler);
    };
  }, [socket]);

  // ✅ GET ORDER
  const handleGetOrder = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/order/get-order-by-id/${orderId}`,
        { withCredentials: true }
      );
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (orderId) handleGetOrder();
  }, [orderId]);

  const assignedShopOrder =
    currentOrder?.shopOrders?.find((o) => o?.assignedDeliveryBoy) || null;

  const shouldShowMap =
    assignedShopOrder &&
    (assignedShopOrder.status === "out for delivery" ||
      assignedShopOrder.status === "delivered");

  return (
    <div className="w-full min-h-screen bg-[#fff9f6]">
      <div className="w-full flex items-center px-3 py-2 relative bg-white shadow-sm">
        <div
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#fff9f6] border border-orange-200 shadow-sm cursor-pointer hover:bg-orange-100"
        >
          <IoIosArrowBack className="text-xl text-[#ff4d2d]" />
        </div>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-purple-800">
          Track Order
        </h1>
      </div>

      <div className="w-full px-4 py-4 space-y-4">
        {currentOrder?.shopOrders?.map((shopOrder, index) => (
          <div
            key={shopOrder._id || index}
            className="bg-white p-4 rounded-2xl shadow-md border border-orange-300 space-y-3"
          >
            <h2 className="text-sm font-semibold text-gray-800">
              {shopOrder?.shop?.name}
            </h2>

            <span className="inline-block text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-600">
              {shopOrder?.status}
            </span>

            <div className="text-sm text-gray-600">
              Items:{" "}
              <span className="font-semibold">
                {shopOrder?.shopOrderItems?.length || 0}
              </span>
            </div>

            <div className="text-sm font-semibold text-green-600">
              ₹{shopOrder?.subTotal}
            </div>

            <div className="pt-2 border-t space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Delivery Boy:</span>
                <span className="font-semibold text-purple-700">
                  {shopOrder?.assignedDeliveryBoy?.fullName || "Not assigned"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Mobile:</span>
                <span className="font-semibold text-gray-800">
                  {shopOrder?.assignedDeliveryBoy?.mobile || "N/A"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/*  MAP SECTION */}
        {shouldShowMap && assignedShopOrder && (
          <DeliveryBoyTracking
            data={{
              deliveryBoyLocation:
                liveLocation[
                  assignedShopOrder?.assignedDeliveryBoy?._id
                ] || {
                  lat:
                    assignedShopOrder?.assignedDeliveryBoy?.location
                      ?.coordinates?.[1] ??
                    currentOrder?.deliveryAddress?.latitude,
                  lon:
                    assignedShopOrder?.assignedDeliveryBoy?.location
                      ?.coordinates?.[0] ??
                    currentOrder?.deliveryAddress?.longitude,
                },
              customerLocation: {
                lat: currentOrder?.deliveryAddress?.latitude,
                lon: currentOrder?.deliveryAddress?.longitude,
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
