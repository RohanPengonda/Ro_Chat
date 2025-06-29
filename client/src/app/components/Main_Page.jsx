"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

import Header from "./Header.jsx";
import ChatCard from "./ChatCard.jsx";
import ChatArea from "./ChatArea.jsx";
import io from "socket.io-client";
import {
  fetchUsers,
  fetchSelf,
  fetchConversations,
  fetchOrCreateConversation,
  fetchMessages,
  sendMessage,
  deleteConversation,
  markMessagesAsRead,
  getUnreadCounts,
  deleteUser,
  updateUserProfile,
} from "../lib/api";
import ProfileForm from "./ProfileForm.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const socket = io(API_URL); // Connects to the backend server

const Main_Page = ({ loggedInUserId }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  // Store all conversations and their last messages
  const [conversations, setConversations] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const [showChatArea, setShowChatArea] = useState(false); // for mobile navigation

  // Helper to get JWT token
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch current user and all other users
  useEffect(() => {
    const fetchUsersAndSelf = async () => {
      setLoading(true);
      try {
        const users = await fetchUsers(loggedInUserId);
        const self = await fetchSelf(loggedInUserId);
        setCurrentUser(self);
        setClients(users);
        // Do not select any chat by default
        // if (users.length > 0) setSelectedClient(users[0]);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
      setLoading(false);
    };
    if (loggedInUserId) fetchUsersAndSelf();
  }, [loggedInUserId]);

  // Fetch all conversations for the current user
  useEffect(() => {
    const fetchAllConversations = async () => {
      if (!currentUser) return;
      const data = await fetchConversations(currentUser._id);
      setConversations(data);
      
      // Fetch unread counts for all conversations
      const counts = await getUnreadCounts(currentUser._id);
      setUnreadCounts(counts);
    };
    if (currentUser) fetchAllConversations();
  }, [currentUser]);

  // Fetch or create conversation and messages when selectedClient changes
  useEffect(() => {
    if (!selectedClient || !currentUser) return;
    const fetchConversationAndMessages = async () => {
      try {
        // Find or create conversation
        const conversation = await fetchOrCreateConversation([
          currentUser._id,
          selectedClient._id,
        ]);
        setConversationId(conversation._id);
        // Fetch messages
        const msgs = await fetchMessages(conversation._id);
        setMessages(msgs);
        // Mark as read if there are unread messages for me
        const hasUnread = msgs.some(
          (msg) => msg.senderId !== currentUser._id && !msg.isRead
        );
        if (hasUnread) {
          await markMessagesAsRead(conversation._id, currentUser._id);
          // Refetch messages to get updated isRead status
          const updatedMsgs = await fetchMessages(conversation._id);
          setMessages(updatedMsgs);
          // Update unread counts
          const counts = await getUnreadCounts(currentUser._id);
          setUnreadCounts(counts);
          // Optimistically update isRead in state
          setMessages((prevMsgs) =>
            prevMsgs.map((msg) =>
              msg.senderId !== currentUser._id ? { ...msg, isRead: true } : msg
            )
          );
        }
        // Join Socket.IO room
        socket.emit("joinConversation", conversation._id);
      } catch (err) {
        console.error("Error fetching conversation/messages:", err);
      }
    };
    fetchConversationAndMessages();
  }, [selectedClient, currentUser]);

  // Socket.IO: Listen for new messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      // Only add message if it belongs to the current conversation
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
      // Optimistically update lastMessage for the relevant conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === msg.conversationId
            ? { ...conv, lastMessage: { text: msg.text, senderId: msg.senderId, timestamp: msg.timestamp } }
            : conv
        )
      );
      // Refetch unread counts for all conversations
      if (currentUser) {
        getUnreadCounts(currentUser._id).then(setUnreadCounts);
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId, currentUser]);

  // Send message handler
  const handleSendMessage = async (messageContent) => {
    if (!conversationId || !currentUser) return;
    try {
      await sendMessage(conversationId, currentUser._id, messageContent);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Clear chat handler
  const handleClearChat = async (client) => {
    if (!conversationId) return;
    try {
      await deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));
      setMessages([]);
      setSelectedClient(null);
      // On mobile, go back to chat list after clearing
      setShowChatArea(false);
      toast.success('Chat cleared!');
    } catch (err) {
      console.error("Error clearing chat messages and conversation:", err);
    }
  };

  // Edit profile handler
  const handleEditProfile = () => setProfileModalOpen(true);
  // Delete account handler
  const handleDeleteAccount = () => setDeleteDialogOpen(true);
  // Confirm delete
  const confirmDeleteAccount = async () => {
    if (!currentUser) return;
    await deleteUser(currentUser._id);
    toast.success('Account deleted successfully!');
    router.push("/login");
  };
  // Update profile
  const handleProfileUpdate = async (data) => {
    if (!currentUser) return;
    await updateUserProfile(currentUser._id, data);
    setProfileModalOpen(false);
    toast.success('Profile updated!');
    // Optionally refetch user info
    window.location.reload();
  };

  // When a chat is selected, show chat area on mobile
  useEffect(() => {
    if (selectedClient) setShowChatArea(true);
  }, [selectedClient]);

  // Handler for back button in chat area (mobile)
  const handleBackToChatList = () => setShowChatArea(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Loading chat data...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        Authentication error. Please log in again.
      </div>
    );
  }

  // Prepare clients with last message preview (for ChatCard)
  const clientsWithPreview = clients.map((client) => {
    // Find the conversation with this client
    const conv = conversations.find((c) =>
      c.participants.some((p) => p._id === client._id)
    );
    const lastMsg = conv && conv.lastMessage ? {
      id: conv._id,
      context: conv.lastMessage.text,
      sender_id: conv.lastMessage.senderId,
      timestamp: conv.lastMessage.timestamp,
    } : undefined;
    
    // Count unread messages for this conversation
    let unreadCount = 0;
    if (conv && conv._id) {
      unreadCount = unreadCounts[conv._id] || 0;
    }
    
    return {
      ...client,
      messages: [],
      lastMessagePreview: lastMsg,
      unreadCount,
    };
  });

  // Prepare messages for ChatArea
  const selectedClientWithMessages = selectedClient
    ? {
        ...selectedClient,
        messages: messages.map((msg) => ({
          ...msg,
          senderName: msg.senderId === currentUser._id ? "You" : selectedClient.name,
          context: msg.text,
        })),
      }
    : null;

  return (
    <div className="flex flex-col min-h-screen h-full bg-gray-100">
      <Header
        userName={currentUser?.name}
        onEditProfile={handleEditProfile}
        onDeleteAccount={handleDeleteAccount}
      />
      <div className="flex flex-1 flex-col md:flex-row w-full max-w-full mx-auto h-full">
        {/* Sidebar / Chat List */}
        <section className={`flex flex-col h-full w-full md:w-[30%] border-r border-gray-200 bg-white md:h-auto md:min-h-screen flex-shrink-0 ${showChatArea && 'hidden md:block'}`}>
          <ChatCard
            clients={clientsWithPreview}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            loggedInUserId={currentUser?._id}
          />
        </section>
        {/* Main Chat Area */}
        <section className={`flex flex-col h-full w-full md:w-[70%] ${!showChatArea && 'hidden md:flex'} bg-white`}>
          {selectedClientWithMessages ? (
            <ChatArea
              customer={selectedClientWithMessages}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onBack={handleBackToChatList}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-700 bg-gray-200 text-center text-base md:text-lg p-4">
              Select a client to start chatting.
            </div>
          )}
          <div ref={messagesEndRef} />
        </section>
      </div>
      <ProfileForm
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSubmit={handleProfileUpdate}
        initialData={currentUser}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account"
        message="Are you sure you want to delete your account? This cannot be undone."
        onConfirm={confirmDeleteAccount}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default Main_Page;
