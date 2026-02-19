import React, { useState } from "react";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const[loading,setLoading]=useState(false)

  const navigate = useNavigate();

  // ---------------- SEND OTP ----------------
  const handleSendOtp = async () => {
    setLoading(true)
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setError("");

      await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );

      setStep(2);
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      setLoading(false)
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async () => {
    setLoading(true)
    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      setError("");

      await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      setStep(3);
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
      setLoading(false)
    }
  };

  // ---------------- RESET PASSWORD ----------------
  const handleResetPassword = async () => {
    setLoading(true)
    if (!newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");

      await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        {
          email,
          newPassword,
        },
        { withCredentials: true }
      );

      navigate("/signin");
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
      setLoading(false)
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center gap-4 mb-6">
          <IoReturnDownBackOutline
            onClick={() => navigate("/signin")}
            size={25}
            className="text-[#ff4d2d] cursor-pointer"
          />
          <h1 className="text-2xl text-[#ff4d2d] font-bold">
            Forgot Password
          </h1>
        </div>

        

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-50 outline-none"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-[#ff4d2d] text-white py-2 rounded-lg"
            >
              {loading? <ClipLoader size={20} color="white" />: "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              disabled={loading}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-50 outline-none"
            />
            <button
              onClick={handleVerifyOtp}
              className="w-full bg-[#ff4d2d] text-white py-2 rounded-lg"
            >
               {loading? <ClipLoader size={20} color="white" />: "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              disabled={loading}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded-lg bg-gray-50 outline-none"
            />
            <input
              type="text"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded-lg bg-gray-50 outline-none"
            />
            <button
              onClick={handleResetPassword}
              className="w-full bg-[#ff4d2d] text-white py-2 rounded-lg"
              disabled={loading}
            >
             {loading? <ClipLoader size={20} color="white" />: "Reset Password"}
            </button>
          </>
        )}
        {/* ERROR */}
        {error && (
          <p className="text-red-600 text-center text-sm mt-2 mb-4">
            * {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
