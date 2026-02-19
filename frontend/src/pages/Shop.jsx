import React, { useEffect, useState } from "react";
import { serverUrl } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaStore } from "react-icons/fa";
import FoodCard from "../components/FoodCard";

function Shop() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState([]);
  const navigate = useNavigate();

  const handleShop = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/get-by-shop/${shopId}`,
        { withCredentials: true },
      );
      setShop(result.data.shop);
      setItems(result.data.items);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    if (shopId) {
      handleShop();
    }
  }, [shopId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-4 py-2 
           rounded-lg shadow-md 
             transition duration-300"
      >
        ⬅
      </button>

      {shop && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 ">
          <img src={shop.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradiemt-to-b fron-black-70 to-black-30 flex flex-col justify-center items-center text-center px-4">
            <FaStore className="text-[#ffffff] text-4xl mb-3 drop-shadow-md" />
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#ffffff] drop-shadow-lg">
              {shop.name}
            </h1>
            <p className="text-lg font-medium text-[#ffffff] mt-[10px]">
              {shop.address}
            </p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2
          class="text-4xl md:text-5xl font-extrabold text-center 
           text-gray-800 tracking-wide mb-8"
        >
          🍽️ Our Menu
        </h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {items.map((item, index) => (
              <div
                key={index}
                className="transform transition duration-300 hover:scale-105"
              >
                <FoodCard data={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-lg font-medium">
              No items available 🍽️
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;
