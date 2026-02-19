import React, { useEffect, useState } from "react";
import { FaUtensils } from "react-icons/fa";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const EditItem = () => {
  const dispatch = useDispatch();
  const navigate=useNavigate()
  const { itemId } = useParams();
  const [currentItem, setCurrentItem] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState("");
  const [frontendImage, setFrontendImage] = useState("");
  const [backendImage, setBackendImage] = useState(null);

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

  // Image handler
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("foodType", foodType);
      formData.append("description", description);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edit-item/${itemId}`,
        formData,
        { withCredentials: true }
      );

      dispatch(setMyShopData(result.data));

      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setFoodType("veg");
      setBackendImage(null);
      setFrontendImage(null);

      navigate("/")
    } catch (error) {
      console.log(error);
      alert("Something went wrong ");
    }
  };
  useEffect(() => {
    const handleGetItemById = async () => {
      try {
        const result = await axios.get(
          `${serverUrl}/api/item/get-by-id/${itemId}`,
          { withCredentials: true }
        );
        setCurrentItem(result.data);
      } catch (error) {}
    };
    handleGetItemById();
  }, [itemId]);
  useEffect(()=>
  {
   setName(currentItem?.name||"")
   setPrice(currentItem?.price||"")
   setCategory(currentItem?.category||"")
   setFoodType(currentItem?.foodType||"")
   setFrontendImage(currentItem?.image||"")
   setDescription(currentItem?.description||"")
  }
  ,[currentItem]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-xl shadow-md border border-orange-100 p-6"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <FaUtensils className="text-[#ff4d2d] w-10 h-10 mb-2" />
          <h1 className="text-xl font-semibold text-gray-800">Edit Item</h1>
          <p className="text-sm text-gray-500">
            Fill details to add a new item to your menu
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 text-sm"
          />

          <input
            type="number"
            placeholder="Price (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 text-sm"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full border rounded-lg px-4 py-2 text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((cate, index) => (
              <option key={index} value={cate}>
                {cate}
              </option>
            ))}
          </select>

          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm"
          >
            <option value="veg">Veg</option>
            <option value="non-veg">Non Veg</option>
          </select>

          <textarea
            rows="3"
            placeholder="Item Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 text-sm resize-none"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full border rounded-lg px-4 py-2 text-sm"
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
          className="w-full mt-6 bg-[#ff4d2d] text-white py-2 rounded-full text-sm font-medium hover:bg-orange-600"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default EditItem;
