import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const Signup = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";

  const navigate = useNavigate();

  // ---------------- STATES ----------------
  const [showPassword, setShowPassword] = useState(false);
  const [borderColor, setBorderColor] = useState("#ddd");
  const [role, setRole] = useState("user");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // ---------------- NORMAL SIGNUP ----------------
  const handleSignup = async () => {
    if (!fullName || !email || !mobile || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);

    try {
      setError("");

    const result=  await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          mobile,
          password,
          role,
        },
        { withCredentials: true }
      );
     dispatch(setUserData(result.data.user)); 
      setLoading(false);
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);
    }
  };

  // ---------------- GOOGLE SIGNUP ----------------
  const handleGoogleAuth = async () => {
    if (!mobile) {
      setError("Mobile number is required for Google signup");
      return; // ❗ very important
    }

    try {
      setError("");

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      console.log("Google Auth Success:", data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Google signup failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
          Vingo
        </h1>

        <p className="text-gray-600 mb-4 text-sm">
          Create your account to get started
        </p>

        {/* Full Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-50 outline-none"
          style={{ border: `1px solid ${borderColor}` }}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-50 outline-none"
          style={{ border: `1px solid ${borderColor}` }}
        />

        {/* Mobile */}
        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-50 outline-none"
          style={{ border: `1px solid ${borderColor}` }}
        />

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-50 outline-none"
            style={{ border: `1px solid ${borderColor}` }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <IoEyeOffSharp /> : <FaRegEye />}
          </button>
        </div>

        {/* Role */}
        <div className="flex gap-2 mb-4">
          {["user", "owner", "deliveryBoy"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-lg text-sm ${
                role === r
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-center text-sm mb-2">* {error}</p>
        )}

        {/* Signup */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full text-white py-2 rounded-lg font-semibold"
          style={{ backgroundColor: primaryColor }}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Signup"}
        </button>

        {/* Google */}
        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-2 py-2 mt-4 border rounded-lg"
        >
          <FcGoogle size={20} />
          Sign up with Google
        </button>

        <p
          className="text-center text-sm mt-4 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account?{" "}
          <span className="text-orange-500 font-medium">Login</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
