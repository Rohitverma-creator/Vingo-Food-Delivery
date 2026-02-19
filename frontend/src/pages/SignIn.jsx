import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const SignIn = () => {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";

  const navigate = useNavigate();

  // ---------------- STATES ----------------
  const [showPassword, setShowPassword] = useState(false);
  const [borderColor, setBorderColor] = useState("#ddd");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // ---------------- NORMAL LOGIN ----------------
  const handleSignin = async () => {
    setLoading(true);
    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }

    try {
      setErr("");

      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        { email, password },
        { withCredentials: true },
      );
      dispatch(setUserData(result.data.user));
      navigate("/");
      setLoading(false);
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid email or password");
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleAuth = async () => {
    try {
      setErr("");

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
        },
        { withCredentials: true },
      );

      dispatch(setUserData(data.user));
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.message || "Google login failed");
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
          Login to continue ordering your favorite food
        </p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-50 outline-none"
          style={{ border: `1px solid ${borderColor}` }}
          onFocus={() => setBorderColor(primaryColor)}
          onBlur={() => setBorderColor("#ddd")}
        />

        {/* Password */}
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-50 outline-none"
            style={{ border: `1px solid ${borderColor}` }}
            onFocus={() => setBorderColor(primaryColor)}
            onBlur={() => setBorderColor("#ddd")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <IoEyeOffSharp /> : <FaRegEye />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-[#ff4d2d] text-sm font-medium"
          >
            Forgot Password?
          </button>
        </div>

        {/* Error */}
        {err && (
          <p className="text-red-600 text-center text-sm mb-2">* {err}</p>
        )}

        {/* Login Button */}
        <button
          onClick={handleSignin}
          disabled={loading}
          className="w-full text-white py-2 rounded-lg font-semibold"
          style={{ backgroundColor: primaryColor }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = hoverColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = primaryColor)
          }
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {/* Google Login */}
        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-2 py-2 mt-4 border rounded-lg"
        >
          <FcGoogle size={20} />
          Login with Google
        </button>

        {/* Redirect */}
        <p
          className="text-center text-sm mt-4 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Don’t have an account?{" "}
          <span className="text-orange-500 font-medium">Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
