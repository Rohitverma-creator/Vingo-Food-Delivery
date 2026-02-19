import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

const UserOrderCart = ({ data }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [selectedRating, setSelectedRating] = useState({});
  const navigate = useNavigate();
  const handleRating = async (itemId, rating) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/item/rating`,
        {
          itemId,
          rating,
        },
        { withCredentials: true },
      );
      setSelectedRating((prev) => ({
        ...prev,
        [itemId]: rating,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-5">
      {/* ORDER HEADER */}
      <div className="flex justify-between border-b pb-3">
        <div>
          <p className="font-semibold text-gray-800">
            Order #{data._id.slice(-6)}
          </p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(data.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-600">
            {data.paymentMethod?.toUpperCase()}
          </p>
          <p className="font-medium text-blue-600">
            {data.shopOrders?.[0]?.status}
          </p>
        </div>
      </div>

      {/* SHOP ORDERS (MULTIPLE RESTAURANTS) */}
      {data.shopOrders?.map((shopOrder, index) => (
        <div
          key={index}
          className="bg-orange-50/40 rounded-xl border border-orange-100 p-4 space-y-4"
        >
          {/* SHOP HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-orange-100 
                              flex items-center justify-center 
                              text-orange-600 font-bold"
              >
                {shopOrder.shop?.name?.charAt(0)}
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  {shopOrder.shop?.name}
                </p>
                <p className="text-xs text-gray-500">Food Order</p>
              </div>
            </div>

            <span
              className={`text-xs font-medium px-3 py-1 rounded-full
                ${
                  shopOrder.status === "delivered"
                    ? "bg-green-100 text-green-700"
                    : shopOrder.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                }`}
            >
              {shopOrder.status?.toUpperCase()}
            </span>
          </div>

          {/* ITEMS */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {shopOrder.shopOrderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 min-w-[120px] max-w-[140px]
                           bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="w-full h-24 rounded-t-xl overflow-hidden bg-gray-100">
                  <img
                    src={item.item.image}
                    alt={item.item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-2 space-y-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.item.name}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>₹{item.item.price}</span>
                    <span>×{item.quantity}</span>
                  </div>
                </div>

                {shopOrder.status == "delivered" && (
                  <div className="flex space-x-1 mt-2 ">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                         handleRating(item.item._id,star)
                        }
                        className={`text-2xl transition duration-200 ${
                          selectedRating[item.item._id] >= star
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}
                      
                      >
                        ★
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SHOP SUBTOTAL */}
          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-sm font-semibold text-gray-800">
              Subtotal: ₹{shopOrder.subTotal}
            </p>
          </div>
        </div>
      ))}

      {/* ✅ ORDER LEVEL FOOTER (ONLY ONCE) */}
      <div className="flex items-center justify-between border-t pt-4 mt-2">
        <div>
          <p className="text-sm text-gray-500">Order Total</p>
          <p className="text-lg font-semibold text-gray-800">
            ₹{data.totalAmount}
          </p>
        </div>

        <button
          onClick={() => navigate(`/track-order/${data._id}`)}
          className="px-5 py-2 rounded-lg bg-orange-500 
                     text-white text-sm font-medium
                     hover:bg-orange-600 transition"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default UserOrderCart;
