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
    <div className="w-full h-[80px] flex items-center justify-between px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] shadow-md">

      {/* Mobile Search */}
      {showSearch && role === "user" && (
        <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg flex items-center gap-[20px] fixed top-[80px] left-[5%] md:hidden z-[9999]">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-200">
            <TbLocationFilled className="w-[25px] h-[25px] text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">
              {currentCity}
            </div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <RxCross1
              size={25}
              className="text-[#ff4d2d] cursor-pointer"
              onClick={() => setShowSearch(false)}
            />
            <input
              type="text"
              placeholder="Search delicious food..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-[10px] text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      {/* Logo */}
      <h1
        className="text-3xl font-bold text-[#ff4d2d] cursor-pointer"
        onClick={() => navigate("/")}
      >
        Vingo
      </h1>

      {/* Desktop Search (Only User) */}
      {role === "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg hidden md:flex items-center gap-[20px]">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-200">
            <TbLocationFilled className="w-[25px] h-[25px] text-[#ff4d2d]" />
            <div className="w-[80%] truncate text-gray-600">
              {currentCity}
            </div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px]">
            <IoSearchSharp size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="Search delicious food..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-[10px] text-gray-700 outline-0 w-full"
            />
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {role === "user" && (
          <>
            <IoSearchSharp
              size={25}
              className="text-[#ff4d2d] md:hidden cursor-pointer"
              onClick={() => setShowSearch(true)}
            />

            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <MdShoppingCart size={25} className="text-[#ff4d2d]" />
              {totalCartItems > 0 && (
                <span className="absolute right-[-8px] top-[-10px] bg-red-500 text-white text-xs w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </div>
          </>
        )}

        {/* Profile Icon */}
        <div
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullName?.slice(0, 1)?.toUpperCase() || "U"}
        </div>

        {/* Dropdown */}
        {showInfo && (
          <div className="absolute top-[80px] right-[20px] w-[220px] bg-white shadow-2xl rounded-xl p-4 flex flex-col gap-3 z-[9999]">

            <div className="text-[16px] font-semibold truncate">
              {userData?.fullName}
            </div>

            {/* USER OPTIONS */}
            {role === "user" && (
              <div
                onClick={() => {
                  navigate("/my-orders");
                  setShowInfo(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] cursor-pointer font-medium"
              >
                <IoReceiptSharp size={18} />
                My Orders
              </div>
            )}

            {/* OWNER OPTIONS */}
            {role === "owner" && (
              <>
                <div
                  onClick={() => {
                    navigate("/owner/dashboard");
                    setShowInfo(false);
                  }}
                  className="cursor-pointer hover:text-[#ff4d2d]"
                >
                  Dashboard
                </div>

                <div
                  onClick={() => {
                    navigate("/my-orders");
                    setShowInfo(false);
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] cursor-pointer font-medium"
                >
                  <IoReceiptSharp size={18} />
                  Shop Orders
                </div>

                <div
                  onClick={() => {
                    navigate("/owner/add-item");
                    setShowInfo(false);
                  }}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#ff4d2d] cursor-pointer font-medium"
                >
                  <FaPlus size={18} />
                  Add Item
                </div>
              </>
            )}

            <div
              onClick={handleLogout}
              className="text-[#ff4d2d] font-semibold cursor-pointer mt-2"
            >
              Log out
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Nav;
