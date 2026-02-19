import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import OwnerItemCard from "./OwnerItemCard";
import OwnerOrderCard from "./OwnerOrderCard";
import useGetMyShop from "../hooks/useGetMyShop";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  useGetMyShop();

  const { myShopData } = useSelector((state) => state.owner);
  const { myOrders } = useSelector((state) => state.user);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
      <Nav />

      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-5 border">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-14 h-14 mb-3" />
              <h2 className="text-lg font-bold">Add Your Restaurant</h2>
              <p className="text-sm text-gray-600 mb-3">
                Join our platform and reach hungry customers daily
              </p>
              <button
                onClick={() => navigate("/create-edit-shop")}
                className="bg-[#ff4d2d] text-white px-4 py-2 rounded-full"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {myShopData && (
        <div className="w-full px-4 flex flex-col items-center mt-5 gap-4">
          {/* SHOP CARD */}
          <div className="bg-white shadow rounded-lg w-full max-w-xl relative">
            <div
              className="absolute top-2 right-2 bg-[#ff4d2d] text-white p-2 rounded cursor-pointer"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={14} />
            </div>

            <img
              className="w-full h-40 object-cover"
              src={myShopData.image}
              alt={myShopData.name}
            />

            <div className="p-3">
              <h2 className="font-semibold">{myShopData.name}</h2>
              <p className="text-sm text-gray-600">
                {myShopData.city}, {myShopData.state}
              </p>
            </div>
          </div>

          {/* ITEMS */}
          {myShopData.items?.length > 0 && (
            <div className="flex flex-col gap-4 w-full max-w-3xl">
              {myShopData.items.map((item) => (
                <OwnerItemCard key={item._id} data={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
