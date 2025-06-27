// Login.tsx
"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isValidGmail, isValidPhone, isStrongPassword } from "../lib/validation";

const Login = () => {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Frontend validation
    if (!identifier) {
      toast.error('Please enter your email or phone number');
      return;
    }
    // Optionally, validate identifier format
    if (!isValidGmail(identifier) && !isValidPhone(identifier)) {
      toast.error('Enter a valid Gmail or 10-digit phone number');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ;
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Login failed");
        return;
      }
      // Store JWT token
      localStorage.setItem("token", result.token);
      localStorage.setItem("current_user_id", result.user.id);
      localStorage.setItem("current_user_name", result.user.name);
      localStorage.setItem("current_user_email", result.user.email || "");
      localStorage.setItem("current_user_mobile_no", result.user.mobile_no || "");
      toast.success("Logged in successfully!");
      router.push("/");
      console.log('Login attempt:', identifier, result.user);
    } catch (err) {
      toast.error("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Toaster />
      <div className="border p-6 rounded w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block p-2">Email or Phone:</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block p-2">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-900 text-white py-2 rounded cursor-pointer hover:bg-green-700"
          >
            Login
          </button>
        </form>
        <button
          className="w-full p-2 cursor-pointer"
          onClick={() => router.push("/signup")}
        >
          Create an account???
        </button>
      </div>
    </div>
  );
};

export default Login;
