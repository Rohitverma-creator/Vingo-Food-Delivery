import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import UserOrderCart from "../components/UserOrderCart";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { setMyOrders, updateRealTimeOrderStatus } from "../redux/userSlice";
import { addMyOrder } from "../redux/userSlice";

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      console.log("NEW ORDER RECEIVED:", data);
      dispatch(addMyOrder(data));
    };

    socket.on("newOrder", handleNewOrder);

    socket?.on("update-status", ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }));
      }
    });

    return () => {
      socket.off("newOrder", handleNewOrder);
      socket?.off("update-status");
    };
  }, [socket, dispatch]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 ">
      <div className="w-full max-w-[800px] p-4 ">
        <div className="flex items-center gap-[20px] mb-6   ">
          <div className=" z-10 " onClick={() => navigate("/")}>
            <IoArrowBack className="text-[24px] text-[#ff4d2d]" />
          </div>
          <h1 className="text-start font-bold text-2xl">My Orders</h1>
        </div>

        <div className="space-y-6">
          {myOrders?.map((order, index) => {
            if (userData.role === "user") {
              return <UserOrderCart data={order} key={index} />;
            }

            if (userData.role === "owner") {
              return <OwnerOrderCard data={order} key={index} />;
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
