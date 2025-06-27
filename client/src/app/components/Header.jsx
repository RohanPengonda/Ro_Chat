import { FiHelpCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { LuRefreshCcwDot } from "react-icons/lu";
import { AiFillMessage } from "react-icons/ai";
// import { IoIosNotificationsOff } from "react-icons/io";
// import { VscDesktopDownload } from "react-icons/vsc";
// import { IoSparklesSharp } from "react-icons/io5";
// import { LuChevronsUpDown } from "react-icons/lu";

// import { IoListOutline } from "react-icons/io5";
// import { FaRegCircle } from "react-icons/fa";
import { useState } from "react";

export default function Header({ userName, onEditProfile, onDeleteAccount }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="flex justify-between items-center shadow-md h-15 p-1 bg-white">
      {/* Left - Title */}
      <div className="flex items-center space-x-2 pl-5 text-gray-600 font-semibold text-sm">
        <AiFillMessage size={18} />
        <span className="text-gray-500 text-[17px]">chats</span>
      </div> 
      <p className="text-gray-500 text-[17px]">
        {userName ? `Welcome, ${userName}` : ""}
      </p>

      {/* Right - Action icons */}
      <div className="flex items-center space-x-3 text-gray-600 text-sm">
    
        <button
          className="flex items-center px-2 py-1 border cursor-pointer border-gray-500 rounded-md bg-red-100 hover:bg-red-400"
          onClick={() => router.push("/logout")}
        >
          <p className="text-[13px] text-gray-900">Logout</p>
        </button>
        <button className="flex items-center px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-100" onClick={handleRefresh}>
          <LuRefreshCcwDot className="mr-1" size={14} />
          <p className="text-[12px]">Refresh</p>
        </button>
       
{/* 
        <button className="flex items-center px-2 py-1 border border-gray-200 rounded-md hover:bg-gray-100">
          <FiHelpCircle className="mr-1" size={14} />
          <p className="text-[12px]">Help</p>
        </button>

        <div className="flex items-center px-2 py-1 border border-gray-200 rounded-md">
          <FaRegCircle size={8} className="text-yellow-400 mr-1" />{" "}
          <p className="text-[12px]">5 / 6 phones</p>
          <LuChevronsUpDown size={12} />
        </div>

        <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-100">
          <VscDesktopDownload size={14} />
        </button>

        <button className="p-1 border border-gray-200 rounded-md hover:bg-gray-100">
          <IoIosNotificationsOff size={14} />
        </button>*/}

        <div className="relative">
          <FaUserCircle
            size={27}
            className="cursor-pointer text-gray-700"
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => { setMenuOpen(false); onEditProfile && onEditProfile(); }}
              >
                Edit Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-600"
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
