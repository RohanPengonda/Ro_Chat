// ChatArea.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoSend, IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { FiPaperclip} from "react-icons/fi";

import { IoIosSearch } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { CiMenuKebab } from "react-icons/ci";
import ConfirmDialog from "./ConfirmDialog";


const ChatArea = ({ customer, onSendMessage, onClearChat, onBack }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [customer.messages]);

  const handleSend = () => {
    if (newMessage.trim() !== "") {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMenuOpen(false);
    setDialogOpen(true);
  };

  const handleConfirmClear = () => {
    setDialogOpen(false);
    if (onClearChat) {
      onClearChat(customer);
    }
    // else: fallback logic can be added if needed
  };

  const handleCancelClear = () => {
    setDialogOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-gray-50 border rounded border-gray-200 h-160 pb-2 overflow-y-scroll">
      <div className="flex flex-row justify-between items-center p-2 md:p-3 font-semibold border-b-1 border-gray-300 shadow-md bg-gray-100 text-xs md:text-base">
        <div className="flex space-x-2 items-center">
          {/* Back button for mobile */}
          <button
            className="md:hidden mr-2 text-gray-700"
            onClick={onBack}
            aria-label="Back to chat list"
          >
            &#8592;
          </button>
          <CgProfile size={20} className="mr-1 text-gray-800" />
          <span className="truncate">{customer.name}</span>
        </div>
        <div className="flex gap-2 items-center">
          <IoIosSearch size={18} />
          <div className="relative">
            <CiMenuKebab size={18} className="cursor-pointer" onClick={() => setMenuOpen((v) => !v)} />
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-10">
                <button
                  className="block w-full text-left px-4 py-2 text-xs md:text-sm cursor-pointer"
                  onClick={handleClearChat}
                >
                  Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide bg-gray-200">
        {/* Add null/undefined check for customer.messages before accessing length */}
        {customer.messages && customer.messages.length > 0 ? (
          customer.messages.map((msg, idx) => {
            // Date separator logic
            const msgDate = new Date(msg.timestamp);
            const prevMsgDate = idx > 0 ? new Date(customer.messages[idx - 1].timestamp) : null;
            const now = new Date();
            const isToday =
              msgDate.getDate() === now.getDate() &&
              msgDate.getMonth() === now.getMonth() &&
              msgDate.getFullYear() === now.getFullYear();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday =
              msgDate.getDate() === yesterday.getDate() &&
              msgDate.getMonth() === yesterday.getMonth() &&
              msgDate.getFullYear() === yesterday.getFullYear();
            const showDateSeparator =
              idx === 0 ||
              msgDate.getDate() !== prevMsgDate.getDate() ||
              msgDate.getMonth() !== prevMsgDate.getMonth() ||
              msgDate.getFullYear() !== prevMsgDate.getFullYear();
            let dateLabel = msgDate.toLocaleDateString([], { month: "short", day: "numeric" });
            if (isToday) dateLabel = "Today";
            else if (isYesterday) dateLabel = "Yesterday";
            return (
              <React.Fragment key={msg.id || idx}>
                {showDateSeparator && (
                  <div className="flex justify-center my-2">
                    <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full shadow">{dateLabel}</span>
                  </div>
                )}
                <div className="mb-2">
                  <div
                    className={`mb-3 flex ${
                      msg.senderName === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs break-all rounded px-3 py-2 shadow-md ${
                        msg.senderName === "You"
                          ? "bg-green-200 text-right"
                          : "bg-gray-100 text-left"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-sm font-bold border-b-1 border-gray-400">
                          {msg.senderName}
                        </span>
                      </div>
                      <div className=" rounded inline-block text-left">
                        {msg.context}
                        <div className=" flex justify-end text-[10px] text-gray-500 ">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {msg.senderName === "You" && (
                            msg.isRead ? (
                              <IoCheckmarkDone className="inline ml-1 text-blue-500" size={14} />
                            ) : (
                              <IoCheckmark className="inline ml-1" size={14} />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          // This will be displayed if customer.messages is an empty array or undefined
          <p className="text-gray-400 text-sm text-center">No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-gray-100">
        <div className="flex items-center justify-between border-t px-4 py-2 ">
          <FiPaperclip className="w-5 h-5 cursor-pointer" />
          <input
            type="text"
            placeholder="Message..."
            value={newMessage}
            onKeyDown={handleKeyDown}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 mx-4 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-300"
          />
          <IoSend
            className="w-6 h-6 text-green-600 cursor-pointer"
            onClick={handleSend}
          />
        </div>

        {/* <div className="flex items-center justify-between ">
          <div className="flex space-x-4 text-gray-600 gap-2 px-6">
            <FiSmile className="w-5 h-5 cursor-pointer" />
            <FiClock className="w-5 h-5 cursor-pointer" />
            <PiClockClockwiseFill className="w-5 h-5 cursor-pointer" />
            <HiOutlineSparkles className="w-5 h-5 cursor-pointer" />
            <FiAlignRight className="w-5 h-5 cursor-pointer" />
            <FaMicrophone className="w-5 h-5 cursor-pointer" />
          </div>

          <div className="flex  space-x-3">
            <div className="flex items-center border border-gray-300 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
              <Image
                src="/logo.jpeg"
                alt="logo"
                width={15}
                height={15}
                className=""
              />
              Periskope
            </div>
          </div>
        </div> */}
      </div>
      <ConfirmDialog
        open={dialogOpen}
        title="Clear Chat"
        message={`Do you want to clear chat with ${customer.name}?`}
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </div>
  );
};

export default ChatArea;
