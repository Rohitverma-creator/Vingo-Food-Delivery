import React from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useDispatch } from "react-redux";
import { removeCartItem, updateQuantity } from "../redux/userSlice";

const CartItemCard = ({ data }) => {
  const dispatch = useDispatch();

  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }));
  };

  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }));
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-md">
      <img
        src={data.image}
        alt={data.name}
        className="w-[80px] h-[80px] object-cover rounded-lg"
      />

      <div className="flex flex-col">
        <h2 className="font-semibold text-[16px]">{data.name}</h2>
        <p className="text-gray-600">
          ₹{data.price} x {data.quantity}
        </p>
        <p className="text-sm text-gray-500">
          ₹{data.price * data.quantity}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => handleDecrease(data._id, data.quantity)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <FaMinus />
        </button>

        <span className="font-semibold">{data.quantity}</span>

        <button
          onClick={() => handleIncrease(data._id, data.quantity)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <FaPlus />
        </button>

        <button
          onClick={() => dispatch(removeCartItem(data._id))}
          className="p-2 bg-red-100 rounded-full hover:bg-red-200"
        >
          <CiTrash className="text-red-600 text-lg" />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
