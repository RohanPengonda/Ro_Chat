// src/app/page.tsx
"use client"; // This component needs to be a Client Component to use useState, useEffect, and useRouter

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Main_Page from "./components/Main_Page.jsx"; // Assuming Main_Page.tsx is in src/app/components/Main_Page.tsx

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null means checking, false means not logged in, true means logged in
  const [loggedInUserId, setLoggedInUserId] = useState(null); // Store the user ID
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const userId = localStorage.getItem("current_user_id");
        if (userId) {
          setLoggedInUserId(userId);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          router.push("/login"); // Redirect to login page
        }
      } catch (error) {
        console.error("Error checking login status from localStorage:", error);
        setIsLoggedIn(false); // Assume not logged in on error
        router.push("/login"); // Redirect to login page
      }
    };

    checkLoginStatus();
  }, [router]); // Re-run when router object is available (though it's stable)

  // Show a loading state while checking authentication
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Checking authentication...
      </div>
    );
  }

  // If not logged in, the router.push will handle redirection, so this won't be rendered directly
  // but if for some reason redirection doesn't happen immediately, we can show a message
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        Redirecting to login...
      </div>
    );
  }

  // If logged in, render the Main_Page
  return <Main_Page loggedInUserId={loggedInUserId} />;
}
