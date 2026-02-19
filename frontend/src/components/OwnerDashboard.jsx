import React from "react";
import Nav from "./Nav";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import { FaPen, FaPlus } from "react-icons/fa6";
import OwnerItemCard from "./OwnerItemCard";
import useGetMyShop from "../hooks/useGetMyShop";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  useGetMyShop();

  const { myShopData } = useSelector((state) => state.owner);

  const noShop =
    !myShopData || Object.keys(myShopData).length === 0;

  const noItems =
    myShopData &&
    myShopData.items &&
    myShopData.items.length === 0;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">
      <Nav />

      {/* No Shop */}
      {noShop && (
        <div className="flex justify-center items-center w-full mt-20 px-4">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 text-center border">
            <FaUtensils className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              You Don't Have a Shop Yet
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Create your restaurant and start receiving orders.
            </p>
            <button
              onClick={() => navigate("/create-edit-shop")}
              className="bg-red-500 hover:bg-red-600 transition text-white px-6 py-2 rounded-full font-semibold"
            >
              Add Shop
            </button>
          </div>
        </div>
      )}

      {/* Shop Exists */}
      {!noShop && (
        <div className="w-full px-4 flex flex-col items-center mt-20 gap-6">

          {/* Shop Card */}
          <div className="bg-white shadow-md rounded-xl w-full max-w-xl relative overflow-hidden">
            <div
              className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full cursor-pointer hover:scale-105 transition"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={14} />
            </div>

            <img
              className="w-full h-48 object-cover"
              src={myShopData.image}
              alt={myShopData.name}
            />

            <div className="p-4">
              <h2 className="font-bold text-lg">
                {myShopData.name}
              </h2>
              <p className="text-sm text-gray-600">
                {myShopData.city}, {myShopData.state}
              </p>
            </div>
          </div>

          {/* If No Items */}
          {noItems && (
            <div className="w-full max-w-md bg-white shadow-md rounded-xl p-6 text-center border">
              <FaPlus className="text-red-500 w-14 h-14 mx-auto mb-4" />
              <h2 className="text-lg font-bold mb-2">
                No Items Added Yet
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Start by adding your first menu item.
              </p>
              <button
                onClick={() => navigate("/add-item")}
                className="bg-red-500 hover:bg-red-600 transition text-white px-6 py-2 rounded-full font-semibold"
              >
                Add Item
              </button>
            </div>
          )}

          {/* If Items Exist */}
          {!noItems && myShopData.items?.length > 0 && (
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
