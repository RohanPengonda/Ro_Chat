import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { LuRefreshCcwDot } from "react-icons/lu";
import { AiFillMessage } from "react-icons/ai";

import { useState } from "react";

export default function Header({ userName, onEditProfile, onDeleteAccount }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-row justify-between items-center shadow-md h-15 p-2 bg-white">
      {/* Left - Title */}
      <div className="flex items-center space-x-2 pl-0 md:pl-5 text-gray-600 font-semibold text-sm">
        <AiFillMessage size={18} />
        <span className="text-gray-500 text-[17px]">chats</span>
      </div> 
      <p className="text-gray-500 text-[15px] md:text-[17px] hidden md:block">
        {userName ? `Welcome, ${userName}` : ""}
      </p>
      {/* Right - Action icons */}
      <div className="flex items-center space-x-3 text-gray-600 text-sm">
        <button className="flex items-center px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-100 text-xs md:text-sm" onClick={handleRefresh}>
          <LuRefreshCcwDot className="mr-1" size={14} />
          <p className="text-[12px]">Refresh</p>
        </button>
        <div className="relative">
          <FaUserCircle
            size={24}
            className="cursor-pointer text-gray-700"
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
              {userName && (
                <div className="px-4 py-2 text-xs text-gray-500 border-b cursor-default select-none">
                  {userName}
                </div>
              )}
              <button
                className="block w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => { setMenuOpen(false); onEditProfile && onEditProfile(); }}
              >
                Edit Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-xs md:text-sm text-red-600 hover:bg-red-200 text-gray-900 border-t border-gray-200 cursor-pointer"
                onClick={() => { setMenuOpen(false); router.push("/logout"); }}
              >
                Logout
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-red-300 text-red-300 hover:text-red-600 cursor-pointer"
                onClick={() => { setMenuOpen(false); onDeleteAccount && onDeleteAccount(); }}
              >
                Delete Account
              </button>
            </div>
          )}
        </div> 
      </div>
    </div>
  );
}
