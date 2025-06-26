"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar.jsx";
import Sidebar_Right from "./Sidebar_Right.jsx";
import Header from "./Header.jsx";
import ChatCard from "./ChatCard.jsx";
import ChatArea from "./ChatArea.jsx";
import io from "socket.io-client";

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

  // Helper to get JWT token
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch current user and all other users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = getToken();
        // Fetch current user
        const resUser = await fetch(`${API_URL}/api/users?exclude=${loggedInUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = await resUser.json();
        // Fetch self info (for display)
        const resSelf = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allUsers = await resSelf.json();
        const self = allUsers.find((u) => u._id === loggedInUserId);
        setCurrentUser(self);
        setClients(users);
        if (users.length > 0) setSelectedClient(users[0]);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
      setLoading(false);
    };
    if (loggedInUserId) fetchUsers();
  }, [loggedInUserId]);

  // Fetch all conversations for the current user
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser) return;
      const token = getToken();
      const res = await fetch(`${API_URL}/api/conversations?userId=${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data);
    };
    if (currentUser) fetchConversations();
  }, [currentUser]);

  // Fetch or create conversation and messages when selectedClient changes
  useEffect(() => {
    if (!selectedClient || !currentUser) return;
    const fetchConversationAndMessages = async () => {
      try {
        const token = getToken();
        // Find or create conversation
        const resConv = await fetch(`${API_URL}/api/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [currentUser._id, selectedClient._id] }),
        });
        const conversation = await resConv.json();
        setConversationId(conversation._id);
        // Fetch messages
        const resMsg = await fetch(`${API_URL}/api/messages?conversationId=${conversation._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const msgs = await resMsg.json();
        setMessages(msgs);
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
    socket.on("newMessage", (msg) => {
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
    });
    return () => {
      socket.off("newMessage");
    };
  }, [conversationId]);

  // Send message handler
  const handleSendMessage = async (messageContent) => {
    if (!conversationId || !currentUser) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          senderId: currentUser._id,
          text: messageContent,
        }),
      });
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
    return {
      ...client,
      messages: [],
      lastMessagePreview: lastMsg,
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
    <div className="flex h-screen">
      {/* <section className="w-15">
        <Sidebar />
      </section> */}
      <div className="flex flex-col flex-1">
        <Header />
        <div className="flex flex-1">
          <section className="w-1/3 border border-gray-100">
            <ChatCard
              clients={clientsWithPreview}
              selectedClient={selectedClient}
              setSelectedClient={setSelectedClient}
              loggedInUserId={currentUser._id}
            />
          </section>
          <section className="flex-1">
            {selectedClientWithMessages ? (
              <ChatArea
                customer={selectedClientWithMessages}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a client to start chatting.
              </div>
            )}
            <div ref={messagesEndRef} />
          </section>
          {/* <section className="w-14">
            <Sidebar_Right />
          </section> */}
        </div>
      </div>
    </div>
  );
};

export default Main_Page;
