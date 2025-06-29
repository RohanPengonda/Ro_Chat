"use client";
import React, { useState, useEffect } from "react";
import { MdFilterList } from "react-icons/md";

const ChatCard = ({
  clients,
  selectedClient,
  setSelectedClient,
  loggedInUserId
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState(clients);

  useEffect(() => {
    // Sort clients by lastMessagePreview.timestamp (descending)
    const sortedClients = [...clients].sort((a, b) => {
      const aTime = a.lastMessagePreview?.timestamp ? new Date(a.lastMessagePreview.timestamp).getTime() : 0;
      const bTime = b.lastMessagePreview?.timestamp ? new Date(b.lastMessagePreview.timestamp).getTime() : 0;
      return bTime - aTime;
    });

    if (searchTerm.trim() === "") {
      setFilteredClients(sortedClients);
      return;
    }
    setFilteredClients(
      sortedClients.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, clients]);

  return (
    <div className="flex-1 h-full flex flex-col bg-gray-50 rounded-md shadow-sm">
      {/* Top Actions */}
      <div className="flex items-center justify-between p-2">
       
        {/* <div className="flex items-center space-x-2"> */}
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-2 py-1 rounded-md text-xs md:text-sm w-full"
          />
          {/* <button className="flex bg-green-100 text-green-700 text-sm px-2 py-1 rounded gap-1">
            <MdFilterList />
            Filtered
          </button> */}
        {/* </div> */}
      </div>
      <hr className="text-gray-200 space-y-2" />

      {/* Chat List */}
      <div className="h-full p-1 space-y-1 bg-gray-50 h-56 md:h-150 rounded overflow-y-auto">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const lastMessage = client.lastMessagePreview;
            const senderLabel = lastMessage
              ? lastMessage.sender_id === loggedInUserId
                ? "You"
                : client.name
              : "";

            return (
              <div
                key={client._id}
                className={`p-2 md:p-3 rounded cursor-pointer hover:bg-gray-100 border border-gray-200 ${
                  selectedClient?._id === client._id ? "bg-gray-200" : ""
                } flex items-center justify-between text-xs md:text-sm`}
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{client.name}</div>
                  <div className="flex items-center text-gray-500 truncate">
                    <span className="truncate">
                      {lastMessage
                        ? `${senderLabel}: ${lastMessage.context}`
                        : "No messages yet."}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end ml-2 min-w-fit h-full" style={{height: '40px'}}>
                  <div>
                    {client.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {client.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto">
                    {lastMessage?.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-xs md:text-sm text-center">
            No matching clients.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatCard;
