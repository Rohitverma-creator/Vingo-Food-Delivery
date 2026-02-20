import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
  },

  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setcurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const qty = cartItem.quantity || 1;

      const existingItem = state.cartItems.find(
        (item) => item._id === cartItem._id,
      );

      if (existingItem) {
        existingItem.quantity += qty;
      } else {
        state.cartItems.push({
          _id: cartItem._id,
          name: cartItem.name,
          image: cartItem.image,
          price: cartItem.price,
          quantity: qty,
          foodType: cartItem.foodType,
          shop: cartItem.shop,
        });
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    updateQuantity: (state, action) => {
      console.log("CART ITEMS:", JSON.parse(JSON.stringify(state.cartItems)));
      console.log("PAYLOAD:", action.payload);
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((item) => item._id === id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },
    removeCartItem: (state, action) => {
      const id = action.payload;

      state.cartItems = state.cartItems.filter((item) => item._id !== id);

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0,
      );
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },
    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;

      const order = state.myOrders.find((o) => o._id === orderId);

      if (order && Array.isArray(order.shopOrders)) {
        const shopOrder = order.shopOrders.find(
          (so) => so.shop?._id === shopId,
        );

        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },
    updateRealTimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;

      const order = state.myOrders.find((o) => o._id === orderId);
      if(order){
        const shopOrder=order.shopOrders.find(so=>so.shop._id==shopId)
        if(shopOrder){
          shopOrder.status=status
        }
      }

    },
    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
  },
});

export const {
  setUserData,
  setCurrentAddress,
  setCurrentCity,
  setcurrentState,
  setShopInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  updateRealTimeOrderStatus,
  setSearchItems,
  setSocket,
} = userSlice.actions;
export default userSlice.reducer;
