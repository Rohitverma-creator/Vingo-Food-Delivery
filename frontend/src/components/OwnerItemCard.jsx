import React from "react";
import { FaPen } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this item?")) return;

      const result = await axios.delete(
        `${serverUrl}/api/item/delete/${data._id}`,
        { withCredentials: true }
      );

      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
      alert("Failed to delete item");
    }
  };

  return (
    <div className="flex w-full max-w-2xl bg-white rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition">
      <div className="w-36 h-32 flex-shrink-0 bg-gray-100">
        <img
          src={data?.image}
          alt={data?.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col justify-between p-4 flex-1">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[#ff4d2d]">
            {data?.name}
          </h2>

          <p className="text-sm text-gray-600">
            Category: <span className="font-medium">{data?.category}</span>
          </p>

          <p className="text-sm text-gray-600">
            Food Type:{" "}
            <span className="font-medium capitalize">{data?.foodType}</span>
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="text-sm text-gray-700">
            <span className="text-gray-500">Price:</span>{" "}
            <span className="font-semibold text-gray-900">
              ₹{data?.price}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <FaPen
              onClick={() => navigate(`/edit-item/${data._id}`)}
              className="cursor-pointer text-blue-500 hover:text-blue-700 transition"
              title="Edit Item"
            />
            <FaTrash
              onClick={handleDelete}
              className="cursor-pointer text-red-500 hover:text-red-700 transition"
              title="Delete Item"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
