import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Logo from "../components/Common/Logo";
import FloatingParticles from "../components/Common/FloatingParticles";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login({ email, pwd });
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        if (data.theme) {
          localStorage.setItem("theme", data.theme);
        }
        toast.success("Welcome to Social Network!");
        navigate("/");
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-ig-bg overflow-hidden transition-colors duration-500">
      {/* Background Floating Particles */}
      <FloatingParticles />

      <div className="w-full max-w-[960px] flex items-center justify-center lg:justify-between gap-12 z-10 py-12">
        {/* Left Hero Section (Desktop Only) */}
        <div className="hidden lg:flex flex-col gap-6 max-w-[460px]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size="large" variant="animated" />
            <h1 className="text-4xl font-extrabold tracking-tight mt-6 text-ig-text leading-tight font-sans">
              Connect & build unbreakable social bonds.
            </h1>
            <p className="text-base text-ig-text-secondary mt-3 leading-relaxed">
              Share your moments, post 24-hour stories, explore trending discussions, and message your connections seamlessly.
            </p>
          </motion.div>

          {/* Floating UI Stat Cards */}
          <div className="grid grid-cols-2 gap-3.5 mt-2">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-ig-surface/90 border border-ig-border backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1 shadow-lg"
            >
              <span className="text-xs font-bold text-ig-primary uppercase tracking-wider">Real-Time Chat</span>
              <span className="text-xs text-ig-text-secondary">Instant DMs & Receipts</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-ig-surface/90 border border-ig-border backdrop-blur-md p-4 rounded-2xl flex flex-col gap-1 shadow-lg"
            >
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">24-Hour Stories</span>
              <span className="text-xs text-ig-text-secondary">Expressive Media Reels</span>
            </motion.div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="w-full max-w-[380px] flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full bg-ig-surface/90 border border-ig-border backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center shadow-2xl"
          >
            <div className="mb-6 flex flex-col items-center gap-2">
              <Logo size="large" />
              <p className="text-xs text-ig-text-secondary font-medium">Log in to your account</p>
            </div>

            <form onSubmit={submitForm} className="w-full flex flex-col gap-3.5">
              <input
                type="email"
                className="input-field"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="input-field"
                placeholder="Password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 w-full flex justify-center items-center h-11 font-bold"
              >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  "Log In"
                )}
              </button>
            </form>
          </motion.div>

          {/* Sign Up Redirect Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
            className="w-full bg-ig-surface/90 border border-ig-border backdrop-blur-xl rounded-2xl py-4 flex justify-center gap-1.5 shadow-lg text-sm"
          >
            <span className="text-ig-text-secondary">Don't have an account?</span>
            <Link to="/SignUp" className="text-ig-primary hover:text-ig-primary-hover font-bold transition-colors">
              Sign up
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
