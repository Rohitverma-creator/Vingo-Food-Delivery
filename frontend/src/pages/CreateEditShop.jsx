import React, { useEffect, useState } from "react";
import { IoReturnDownBack } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";
import Shop from "./Shop";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { myShopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(
    (state) => state.user,
  );

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (myShopData) {
      setName(myShopData.name || "");
      setAddress(myShopData.address || "");
      setCity(myShopData.city || "");
      setState(myShopData.state || "");
      setFrontendImage(myShopData.image || "");
    } else {
      setCity(currentCity || "");
      setState(currentState || "");
      setAddress(currentAddress || "");
    }
  }, [myShopData, currentCity, currentState, currentAddress]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("address", address);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true },
      );

      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <div className="flex justify-center flex-col items-center p-6 bg-orange-50 relative min-h-screen">
      <div className="absolute top-[20px] left-[20px] z-[10]">
        <IoReturnDownBack
          onClick={() => navigate("/")}
          size={35}
          className="text-[#ff4d2d] sm:pl-4 mt-2 cursor-pointer"
        />
      </div>

      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="w-16 h-16 text-[#e10eb0]" />
          </div>

          <div className="text-3xl font-extrabold text-gray-900 mb-2">
            {myShopData ? "Edit Shop" : "Add Shop"}
          </div>

          <form className="space-y-5 w-full" onSubmit={handleSubmit}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shop Name"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full px-4 py-2 border rounded-lg"
            />

            {frontendImage && (
              <img
                src={frontendImage}
                alt="shop"
                className="w-full h-48 object-cover rounded-lg border"
              />
            )}

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <button className="w-full bg-[#ff4d2d] text-white py-3 rounded-xl">
              {loading ? <ClipLoader size={20} color="#ffffff" /> : "Save Shop"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEditShop;
