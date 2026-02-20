import React from "react";
import { useNavigate } from "react-router-dom";

const ComingSoon = () => {
  const navigate = useNavigate();

  const handleDemoClick = () => {
    navigate("/?demo=lucknow");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-between px-10 md:px-20 bg-[#f6e7e5] overflow-hidden">
      {/* LEFT CONTENT */}
      <div className="max-w-xl animate-fadeIn">
        <h1 className="text-6xl md:text-7xl font-serif text-[#0f1c4d] leading-tight">
          Coming <br /> Soon
        </h1>

        <h2 className="text-4xl md:text-5xl font-serif text-red-600 mt-4">
          Stay tuned!
        </h2>

        <p className="text-gray-600 mt-6 text-lg">
          We’re expanding to your area very soon. Currently live in Lucknow.
        </p>

        {/* DEMO BUTTON */}
        <button
          onClick={handleDemoClick}
          className="mt-8 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition duration-300"
        >
          View Demo
        </button>
      </div>

      {/* RIGHT SIDE SHAPE */}
      <div className="hidden md:flex items-center justify-center relative">
        <div className="w-[400px] h-[400px] bg-gradient-to-br from-pink-200 via-purple-200 to-red-200 rounded-full blur-2xl absolute animate-pulse"></div>

        <div className="w-[350px] h-[350px] bg-white rounded-full shadow-2xl flex items-center justify-center relative">
          <div className="w-16 h-16 bg-red-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
