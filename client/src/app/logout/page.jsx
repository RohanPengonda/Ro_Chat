"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const performLogout = () => {
      try {
        localStorage.removeItem("current_user_id");
        localStorage.removeItem("current_user_name");
        localStorage.removeItem("current_user_email");
        localStorage.removeItem("current_user_mobile_no");
        router.push("/login"); // Redirect to login
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
    performLogout();
  }, [router]);

  return null; // No UI needed
};

export default Logout;
