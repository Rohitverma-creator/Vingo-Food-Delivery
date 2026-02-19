import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const ComingSoon = () => {
  const location = useLocation();
  const city = location.state?.city || "your city";

  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1200);
    const timer2 = setTimeout(() => setStep(2), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 text-center relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-green-500 opacity-20 blur-3xl rounded-full"></div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-4xl font-bold"
      >
        🔍 Searching Restaurants...
      </motion.h1>

      <p className="mt-4 text-gray-400">
        Looking for partners in {city}
      </p>

      {/* Animated Dots */}
      <motion.div
        className="mt-6 text-3xl"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        ...
      </motion.div>

      {step >= 1 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-red-400 text-lg"
        >
          ❌ No restaurants found in {city}
        </motion.p>
      )}

      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-green-400 font-semibold">
            🚀 Expansion in Progress
          </p>
          <p className="text-gray-400 text-sm mt-2">
            We're onboarding new partners soon.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ComingSoon;
