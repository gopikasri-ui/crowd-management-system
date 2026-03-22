import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const { loginDirect } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://crowd-backend-0m8x.onrender.com/api/auth/login",
        loginForm
      );
      setPhone(res.data.phone);
      setStep("otp");
      toast.success("OTP sent! Use 123456 for demo");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Login failed. Check email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://crowd-backend-0m8x.onrender.com/api/auth/signup",
        signupForm
      );
      setPhone(signupForm.phone);
      setStep("otp");
      toast.success("Account created! Use OTP 123456 to verify");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "https://crowd-backend-0m8x.onrender.com/api/auth/verify-otp",
        { phone, otp }
      );
      loginDirect(res.data);
      toast.success("Welcome to CrowdAI!");
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Invalid OTP. Use 123456"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 border border-cyan-500/30 rounded-2xl p-8">

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚨</div>
          <h1 className="text-2xl font-bold text-cyan-400">
            AI Crowd System
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Emergency Management Platform
          </p>
        </div>

        {step === "otp" ? (
          <div>
            <div className="text-center mb-6">
              <p className="text-3xl mb-2">📱</p>
              <p className="text-green-400 font-bold text-lg">
                OTP Verification
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Enter the 6-digit code sent to
              </p>
              <p className="text-cyan-400 font-bold">{phone}</p>
              <div className="mt-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-2">
                <p className="text-yellow-400 text-sm font-bold">
                  Demo OTP: 123456
                </p>
              </div>
            </div>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4 text-center text-2xl tracking-widest focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full text-gray-400 text-sm hover:text-white transition py-2"
              >
                Back to {mode === "login" ? "Login" : "Sign Up"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode("login")}
                className={
                  "flex-1 py-2 rounded-xl font-bold text-sm transition " +
                  (mode === "login"
                    ? "bg-cyan-500 text-gray-950"
                    : "bg-gray-800 text-gray-400 hover:text-white")
                }
              >
                Login
              </button>
              <button
                onClick={() => setMode("signup")}
                className={
                  "flex-1 py-2 rounded-xl font-bold text-sm transition " +
                  (mode === "signup"
                    ? "bg-cyan-500 text-gray-950"
                    : "bg-gray-800 text-gray-400 hover:text-white")
                }
              >
                Sign Up
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition"
                >
                  {loading ? "Please wait..." : "Login"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-cyan-400 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signupForm.name}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="Create a password"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-cyan-400 uppercase tracking-widest block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, phone: e.target.value })
                    }
                    placeholder="+919876543210"
                    required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-cyan-400 hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}

            <div className="mt-4 p-3 bg-gray-800 rounded-xl text-center">
              <p className="text-xs text-gray-500">
                After login or signup — OTP screen will appear
              </p>
              <p className="text-xs text-yellow-400 font-bold mt-1">
                Use OTP: 123456 for demo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}