import React, { useState } from "react";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

const AddItem = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading,setLoading]=useState(false)
  const categories = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
    if (!backendImage) {
      alert("Please select an image");
      return;
    }

    try {
      setLoading(true)
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("foodType", foodType); // veg | nonveg
      formData.append("image", backendImage);

      const result = await axios.post(
        `${serverUrl}/api/item/add-item`,
        formData,
        { withCredentials: true }
      );

      dispatch(setMyShopData(result.data));
      setLoading(false)
      navigate("/");
    } catch (error) {
      console.log("ADD ITEM FRONTEND ERROR:", error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-xl shadow-md border border-orange-100 p-6"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <FaUtensils className="text-[#ff4d2d] w-10 h-10 mb-2" />
          <h1 className="text-xl font-semibold">Add New Food Item</h1>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="veg">Veg</option>
            <option value="nonveg">Non Veg</option>
          </select>

          <input
            type="file"
            accept="image/*"
            required
            onChange={handleImage}
            className="w-full border rounded-lg px-4 py-2"
          />

          {frontendImage && (
            <img
              src={frontendImage}
              alt="preview"
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-[#ff4d2d] text-white py-2 rounded-full"
        >
        {loading ? <ClipLoader size={20} color="#ffffff" /> : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default AddItem;
