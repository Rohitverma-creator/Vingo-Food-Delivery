import React, { useState, useEffect } from "react";
import { TbLocationFilled } from "react-icons/tb";
import { IoSearchSharp, IoReceiptSharp } from "react-icons/io5";
import { MdShoppingCart } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Nav = () => {
  const userData = useSelector((state) => state.user.userData);
  const currentCity = useSelector((state) => state.user.currentCity);
  const cartItems = useSelector((state) => state.user.cartItems);

  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  const handleSearchItems = async (searchText) => {
    try {
      if (!searchText || searchText.trim() === "") return;

      const result = await axios.get(`${serverUrl}/api/item/search-items`, {
        params: {
          query: searchText,
          city: currentCity,
        },
        withCredentials: true,
      });

      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearchItems(query);
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const role = userData?.role?.toLowerCase();

  return (
    <div className="w-full h-[75px] flex items-center justify-between px-6 fixed top-0 z-[9999] bg-white border-b border-gray-200">

      {/* Logo */}
      <h1
        className="text-2xl md:text-3xl font-extrabold text-red-500 cursor-pointer tracking-wide"
        onClick={() => navigate("/")}
      >
        Vingo
      </h1>

      {/* Desktop Search */}
      {role === "user" && (
        <div className="hidden md:flex items-center w-[45%] bg-gray-100 rounded-full px-4 py-2 gap-3 transition-all focus-within:bg-white focus-within:shadow-md">
          <TbLocationFilled className="text-red-500 text-xl" />
          <span className="text-sm text-gray-600 truncate w-[90px]">
            {currentCity}
          </span>

          <div className="h-5 w-[1px] bg-gray-300"></div>

          <IoSearchSharp className="text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search food..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {role === "user" && (
          <>
            {/* Mobile Search Icon */}
            <IoSearchSharp
              size={22}
              className="text-gray-600 md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />

            {/* Cart */}
            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <MdShoppingCart size={24} className="text-gray-700" />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {totalCartItems}
                </span>
              )}
            </div>
          </>
        )}

        {/* Profile Circle */}
        <div
          className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-semibold shadow-md cursor-pointer hover:scale-105 transition"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.slice(0, 1)?.toUpperCase() || "U"}
        </div>

        {/* Dropdown */}
        {showInfo && (
          <div className="absolute top-[75px] right-6 w-[230px] bg-white shadow-xl rounded-xl p-4 flex flex-col gap-3 border border-gray-100">

            <div className="text-sm font-semibold truncate text-gray-800">
              {userData?.fullName}
            </div>

            {role === "user" && (
              <div
                onClick={() => {
                  navigate("/my-orders");
                  setShowInfo(false);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500 cursor-pointer text-sm"
              >
                <IoReceiptSharp size={18} />
                My Orders
              </div>
            )}

            {role === "owner" && (
              <>
                <div
                  onClick={() => {
                    navigate("/owner/dashboard");
                    setShowInfo(false);
                  }}
                  className="text-sm text-gray-600 hover:text-red-500 cursor-pointer"
                >
                  Dashboard
                </div>

                <div
                  onClick={() => {
                    navigate("/my-orders");
                    setShowInfo(false);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 cursor-pointer text-sm"
                >
                  <IoReceiptSharp size={18} />
                  Shop Orders
                </div>

                <div
                  onClick={() => {
                    navigate("/add-item");
                    setShowInfo(false);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 cursor-pointer text-sm"
                >
                  <FaPlus size={18} />
                  Add Item
                </div>
              </>
            )}

            <div
              onClick={handleLogout}
              className="text-red-500 text-sm font-semibold cursor-pointer mt-2 border-t pt-2"
            >
              Log out
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Panel */}
      {showSearch && role === "user" && (
        <div className="fixed top-[75px] left-0 w-full bg-white shadow-md p-4 flex items-center gap-3 md:hidden">
          <RxCross1
            size={20}
            className="text-red-500 cursor-pointer"
            onClick={() => setShowSearch(false)}
          />
          <input
            type="text"
            placeholder="Search food..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline-none w-full text-sm"
          />
        </div>
      )}

    </div>
  );
};

export default Nav;
