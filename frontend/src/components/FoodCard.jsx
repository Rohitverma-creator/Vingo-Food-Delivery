import React, { useState } from "react";
import { FaLeaf, FaDrumstickBite } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaPlus, FaMinus } from "react-icons/fa";
import { BsCart3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.user.cartItems);

  const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }, (_, i) =>
      i + 1 <= rating ? (
        <IoIosStar key={i} className="text-yellow-500 text-lg" />
      ) : (
        <FaRegStar key={i} className="text-yellow-500 text-lg" />
      ),
    );
  };

  const handleAddToCart = () => {
    if (quantity <= 0) return;

    dispatch(
      addToCart({
        _id: data._id,
        name: data.name,
        image: data.image,
        price: data.price,
        quantity: quantity,
        foodType: data.foodType,
        shop: data.shop,
      }),
    );
  };

  return (
    <div className="w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white">
        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow">
          {data.foodType === "veg" ? (
            <FaLeaf className="text-green-600 text-lg" />
          ) : (
            <FaDrumstickBite className="text-red-600 text-lg" />
          )}
        </div>
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {data.name}
        </h1>

        <div className="flex items-center gap-1 mt-1">
          {renderStars(data.rating?.average)}
          <span>{data.rating?.count || 0}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3">
          <span>₹{data.price}</span>

          <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
            <button
              className="px-2 py-1 hover:bg-gray-100"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <FaMinus />
            </button>

            <span className="px-2">{quantity}</span>

            <button
              className="px-2 py-1 hover:bg-gray-100"
              onClick={() => setQuantity(quantity + 1)}
            >
              <FaPlus />
            </button>

            <button
              onClick={handleAddToCart}
              className={`${
                cartItems.some((item) => item._id === data._id)
                  ? "bg-gray-800"
                  : "bg-orange-500"
              } text-white px-3 py-2 transition-colors`}
            >
              <BsCart3 />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
