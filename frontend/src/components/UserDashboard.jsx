import React, { useEffect, useRef, useState } from "react";
import Nav from "./Nav";
import { FaCircleChevronLeft } from "react-icons/fa6";
import { FaChevronCircleRight } from "react-icons/fa";
import CategoryCard from "./CategoryCard";
import { categories } from "../category";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import ComingSoon from "../pages/ComingSoon";

const UserDashboard = () => {
  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);

  const [showLeftCateButton, setShowLeftCateButton] = useState(false);
  const [showRightCateButton, setShowRightCateButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemList, setUpdatedItemList] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCity = useSelector((state) => state.user.currentCity);
  const shopInMyCity = useSelector((state) => state.user.shopInMyCity);
  const itemsInMyCity = useSelector((state) => state.user.itemsInMyCity);
  const searchItems = useSelector((state) => state.user.searchItems);
  const role = useSelector((state) => state.user.userData?.role);

  const navigate = useNavigate();

  // loading control
  useEffect(() => {
    if (shopInMyCity !== undefined) {
      setLoading(false);
    }
  }, [shopInMyCity]);

  // update items
  useEffect(() => {
    setUpdatedItemList(itemsInMyCity);
  }, [itemsInMyCity]);

  const handleFilterByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemList(itemsInMyCity);
    } else {
      const filteredList = itemsInMyCity.filter((i) => i.category === category);
      setUpdatedItemList(filteredList);
    }
  };

  // scroll helper
  const updateButton = (ref, setLeft, setRight) => {
    const el = ref.current;
    if (!el) return;

    const canScroll = el.scrollWidth > el.clientWidth + 5;

    setLeft(canScroll && el.scrollLeft > 0);
    setRight(canScroll && el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scrollHandler = (ref, direction) => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const cateEl = cateScrollRef.current;
    const shopEl = shopScrollRef.current;

    if (!cateEl || !shopEl) return;

    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton);
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton);

    const handleCateScroll = () =>
      updateButton(
        cateScrollRef,
        setShowLeftCateButton,
        setShowRightCateButton,
      );

    const handleShopScroll = () =>
      updateButton(
        shopScrollRef,
        setShowLeftShopButton,
        setShowRightShopButton,
      );

    cateEl.addEventListener("scroll", handleCateScroll);
    shopEl.addEventListener("scroll", handleShopScroll);

    return () => {
      cateEl.removeEventListener("scroll", handleCateScroll);
      shopEl.removeEventListener("scroll", handleShopScroll);
    };
  }, []);

  if (!loading && role === "user" && shopInMyCity?.length === 0) {
    return <ComingSoon city={currentCity} />;
  }

  return (
    <div className="w-screen min-h-screen flex flex-col gap-4 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />

      {/* SEARCH RESULT */}
      {searchItems && searchItems.length > 0 && (
        <div className="absolute top-[90px] left-0 w-full bg-white shadow-xl rounded-xl p-4 z-[999] max-h-[400px] overflow-y-auto">
          {searchItems.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-lg"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{item.name}</span>
                <span className="text-sm text-gray-500">{item.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY SECTION */}
      <div className="w-full max-w-6xl flex flex-col gap-4 items-start p-2">
        <h1 className="text-gray-800 text-xl sm:text-2xl font-semibold">
          Inspiration for your first order
        </h1>

        <div
          ref={cateScrollRef}
          className="w-full flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-[#ff4d2d]"
        >
          {categories.map((cate, index) => (
            <CategoryCard
              key={index}
              data={cate}
              onClick={() => handleFilterByCategory(cate.category)}
            />
          ))}
        </div>
      </div>

      {/* SHOP SECTION */}
      <div className="w-full max-w-6xl flex flex-col gap-4 items-start p-2">
        <h1 className="text-gray-800 text-xl sm:text-2xl font-semibold">
          Best Shop in {currentCity}
        </h1>

        <div
          ref={shopScrollRef}
          className="w-full flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-[#ff4d2d]"
        >
          {shopInMyCity?.map((shop) => (
            <div
              key={shop._id}
              className="min-w-[150px] bg-white rounded-lg shadow-sm p-2 flex flex-col gap-1"
            >
              <img
                onClick={() => navigate(`/shop/${shop._id}`)}
                src={shop.image || shop.logo}
                alt={shop.shopName}
                className="w-full h-20 object-cover rounded-md cursor-pointer"
              />

              <h2 className="text-sm font-semibold text-gray-800 truncate">
                {shop.shopName}
              </h2>

              <p className="text-xs text-gray-600 truncate">{shop.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOD SECTION */}
      <div className="w-full max-w-6xl flex flex-col gap-3 items-start p-2">
        <h1 className="text-gray-800 text-xl sm:text-2xl font-semibold">
          Suggested Food Items
        </h1>

        <div className="w-full flex flex-wrap gap-[20px] justify-center">
          {updatedItemList?.map((item, index) => (
            <FoodCard key={index} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
