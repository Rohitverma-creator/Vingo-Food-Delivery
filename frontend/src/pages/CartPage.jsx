import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CartItemCard from "../components/CartItemCard";

const CartPage = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.user.cartItems);
  const totalAmount = useSelector((state) => state.user.totalAmount);
  console.log(
  "CART IDS:",
  cartItems.map((i) => i._id)
);
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-[20px] mb-6   ">
          <div className=" z-10 " onClick={() => navigate("/")}>
            <IoArrowBack className="text-[24px] text-[#ff4d2d]" />
          </div>
          <h1 className="text-center text-[24px] font-bold ">Your Cart</h1>
        </div>
        {cartItems?.length == 0 ? (
          <p className="text-center text-[18px]">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems?.map((item) => (
                <CartItemCard data={item} key={item._id} />
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border">
              <h1 className="font-semibold text-lg">Total Amount</h1>
              <span className="font-bold text-lg text-[#ff4d2d]">
                ₹{totalAmount}
              </span>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 bg-[#ff4d2d] text-white py-3 rounded-lg font-semibold hover:bg-[#e04328] transition-colors duration-300"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
