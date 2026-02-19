import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import Signup from "./pages/Signup";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import CreateEditShop from "./pages/CreateEditShop";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";
import CartPage from "./pages/CartPage";
import CheckOut from "./pages/CheckOut";
import OrderPlace from "./pages/OrderPlace";
import MyOrders from "./pages/MyOrders";
import TrackOrderPage from "./pages/TrackOrderPage";
import Shop from "./pages/Shop";

import useGetCurrentUser from "./hooks/useGetCurrentUser";
import useGetCity from "./hooks/useGetCity";
import useGetShopByCity from "./hooks/useGetShopByCity";
import useGetItemByCity from "./hooks/useGetItemsByCity";
import useGetMyOrders from "./hooks/useGetMyOrder";
import useUpdateLocation from "./hooks/useUpdateLocation";

import { setSocket } from "./redux/userSlice";
import OrderDeliveredSuccessfully from "./pages/OrderDeliveredSuccessfully";
import ComingSoon from "./pages/ComingSoon";

export const serverUrl = "https://vingo-backend-cqic.onrender.com";

const App = () => {
  useGetCurrentUser();
  useGetCity();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();
  useUpdateLocation();

  const dispatch = useDispatch();
  const { userData, socket, addMyOrder } = useSelector((state) => state.user);

  useEffect(() => {
    if (!socket) {
      const socketInstance = io(serverUrl, {
        withCredentials: true,
      });
      dispatch(setSocket(socketInstance));
    }
  }, [socket, dispatch]);

  useEffect(() => {
    if (!socket || !userData?._id) return;
    socket.emit("identity", { userId: userData._id });
  }, [socket, userData]);

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <Signup /> : <Navigate to="/" />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />
      <Route
        path="/create-edit-shop"
        element={userData ? <CreateEditShop /> : <Navigate to="/signin" />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to="/signin" />}
      />
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to="/signin" />}
      />
      <Route
        path="/cart"
        element={userData ? <CartPage /> : <Navigate to="/signin" />}
      />
      <Route
        path="/checkout"
        element={userData ? <CheckOut /> : <Navigate to="/signin" />}
      />
      <Route
        path="/order-placed"
        element={userData ? <OrderPlace /> : <Navigate to="/signin" />}
      />
      <Route
        path="/my-orders"
        element={userData ? <MyOrders /> : <Navigate to="/signin" />}
      />
      <Route
        path="/track-order/:orderId"
        element={userData ? <TrackOrderPage /> : <Navigate to="/signin" />}
      />
      <Route
        path="/shop/:shopId"
        element={userData ? <Shop /> : <Navigate to="/signin" />}
      />
      <Route
        path="/order-delivered"
        element={
          userData ? <OrderDeliveredSuccessfully /> : <Navigate to="/signin" />
        }
      />
    </Routes>
  );
};

export default App;
