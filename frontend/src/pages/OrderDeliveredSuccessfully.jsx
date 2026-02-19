import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";

const OrderDeliveredSuccessfully = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-[90%] md:w-[400px]">

        <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Order Delivered Successfully 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          The order has been delivered to the customer.
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition duration-300"
        >
          Go To Home
        </button>

      </div>
    </div>
  );
};

export default OrderDeliveredSuccessfully;
