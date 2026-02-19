import React, { useState } from "react";
import { FaPhone } from "react-icons/fa6";
import { serverUrl } from "../App";
import axios from "axios";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";

const OwnerOrderCard = ({ data }) => {
  const shopOrder = data.shopOrders?.[0];
  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async (orderId, shopId, status) => {
    if (!status) return;

    if (shopOrder?.status === "delivered") {
      alert("Delivered order cannot be modified");
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true },
      );

      dispatch(updateOrderStatus({ orderId, shopId, status }));

      setAvailableBoys(result.data.availableBoys || []);
    } catch (error) {
      console.log(error);
    }
  };

  const isDelivered = shopOrder?.status === "delivered";

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-5 border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {data.user?.fullName}
          </h2>
          <p className="text-sm text-gray-500">{data.user?.email}</p>
          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <FaPhone className="text-orange-500" />
            <span>{data.user?.mobile}</span>
          </p>
          <p className="mt-2 text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>Payment Method:</span>
            <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              {data.paymentMethod}
            </span>
          </p>
        </div>

        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            shopOrder?.status === "delivered"
              ? "bg-green-100 text-green-700"
              : shopOrder?.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
          }`}
        >
          {shopOrder?.status?.toUpperCase()}
        </span>

        <select
          onChange={(e) =>
            handleUpdateStatus(data._id, shopOrder?.shop?._id, e.target.value)
          }
          className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 hover:border-orange-400 transition"
        >
          <option value="" disabled={isDelivered}>
            Change Status
          </option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out for delivery">Out for Delivery</option>
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
        <p className="text-sm font-medium text-gray-800">Delivery Address</p>
        <p className="text-sm text-gray-700">{data.deliveryAddress?.text}</p>
        <p className="text-xs text-gray-500">
          Lat: {data.deliveryAddress?.latitude}, Long:{" "}
          {data.deliveryAddress?.longitude}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-800">Ordered Items</p>

        {(shopOrder?.shopOrderItems || []).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-2"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.item?.image}
                alt={item.item?.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {item.item?.name}
                </p>
                <p className="text-xs text-gray-500">
                  ₹{item.item?.price} × {item.quantity}
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              ₹{item.item?.price * item.quantity}
            </p>
          </div>
        ))}
      </div>

      {shopOrder?.status === "out for delivery" && (
        <div className="mt-3 p-3 border rounded-lg bg-orange-50">
          <p className="font-semibold mb-2">
            {shopOrder?.assignedDeliveryBoy
              ? "Assigned delivery boy"
              : "Available delivery boys"}
          </p>

          {shopOrder?.assignedDeliveryBoy ? (
            <div className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
              <div>
                <p className="font-medium">
                  {shopOrder.assignedDeliveryBoy.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {shopOrder.assignedDeliveryBoy.mobile}
                </p>
              </div>
            </div>
          ) : availableBoys.length > 0 ? (
            availableBoys.map((b, index) => (
              <div
                key={b._id || index}
                className="flex justify-between items-center p-2 mb-2 bg-white rounded shadow-sm"
              >
                <div>
                  <p className="font-medium">{b.fullName}</p>
                  <p className="text-sm text-gray-600">{b.mobile}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No delivery boys available nearby
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center border-t pt-3">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-lg font-semibold text-gray-800">
          ₹{shopOrder?.subTotal}
        </p>
      </div>
    </div>
  );
};

export default OwnerOrderCard;
