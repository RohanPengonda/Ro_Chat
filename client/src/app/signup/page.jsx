"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import { isValidGmail, isValidPhone, isStrongPassword } from "../lib/validation";

const Signup = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile_no, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    // Frontend validation
    if (!isValidGmail(email)) {
      toast.error('Email must be a valid Gmail address');
      return;
    }
    if (!isValidPhone(mobile_no)) {
      toast.error('Mobile number must be 10 digits');
      return;
    }
    if (!isStrongPassword(password)) {
      toast.error('Password must be at least 8 characters and include upper, lower, number, and special character');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile_no, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Signup failed");
        return;
      }
      toast.success("User Created. Now You can Login");
      router.push("/login");
    } catch (err) {
      toast.error("Signup failed");
    }
  };

  const socket = io(API_URL);

  return (
    <div className="flex items-center justify-center h-screen">
      <Toaster />
      <div className="border p-6 rounded w-80">
        <h2 className="text-2xl font-bold mb-4 text-center border-b-2">
          Sign Up
        </h2>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block">Name:</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block">Mobile No:</label>
            <input
              type="text"
              value={mobile_no}
              onChange={(e) => setMobileNo(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block">Password:</label>
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
            className="w-full bg-green-900 text-white py-2 rounded hover:bg-green-700 cursor-pointer"
          >
            Sign Up
          </button>
        </form>
        <button
          className="w-full p-2 cursor-pointer"
          onClick={() => router.push("/login")}
        >
          Already have an account???
        </button>
      </div>
    </div>
  );
};

export default Signup;
