import React, { useState, useEffect } from "react";
import {
  addChat,
  getChats,
  getMessages,
  deleteChat,
} from "../utils/handle_request.utils";
import { handleNewChat } from "../utils/chats.utils";

export default function Chats({
  toggleChatList,
  chats,
  setChats,
  selectedChat,
  setSelectedChat,
  setMessages,
  messages,
  setIsFetchingMessages,
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const addMessage = (text, isUser) => {
    setMessages((prevMessages) => [...prevMessages, { text, isUser }]);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setMessages([]);
      setIsFetchingMessages(true);
      if (selectedChat !== null) {
        try {
          const response = await getMessages(
            `/api/messages/${selectedChat.id}`
          );
          if (response.success) {
            response.data.forEach((message) => {
              addMessage(message.HumanMessage, true);
              addMessage(message.AIMessage, false);
            });
          } else {
            console.error("Error getting messages:", response.error);
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setIsFetchingMessages(false);
        }
      } else {
        setIsFetchingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  const handleChatSelection = (chat) => {
    setSelectedChat(chat);
    if (window.innerWidth < 768) {
      toggleChatList();
    }
  };

  const handleNewChatClick = async () => {
    setIsCreatingChat(true);
    try {
      await handleNewChat(setChats, setSelectedChat);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const confirmDeleteChat = (chat) => {
    setChatToDelete(chat);
    setShowConfirmDialog(true);
  };

  const handleChatDeletion = async () => {
    if (!chatToDelete) return;

    if (selectedChat?.id === chatToDelete.id) {
      setSelectedChat(null);
    }
    if (messages.length > 0) {
      setMessages([]);
    }
    setChats((prevChats) => prevChats.filter((c) => c.id !== chatToDelete.id));
    try {
      const response = await deleteChat(`/api/chats/${chatToDelete.id}`);
      if (response.success) {
        setChats((prevChats) => prevChats.filter((c) => c.id !== chatToDelete.id));
        if (selectedChat?.id === chatToDelete.id) {
          setSelectedChat(null);
          setMessages([]);
        }
      } else {
        console.error("Error deleting chat:", response.error);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setShowConfirmDialog(false);
      setChatToDelete(null);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-700 overflow-y-auto transition duration-500 ease-in-out">
      <div className=" mx-auto text-nowrap">
        <div className="flex justify-between items-center mb-4 px-4 sticky top-0 bg-white dark:bg-gray-700 py-4 transition duration-500 ease-in-out">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white transition duration-500 ease-in-out">
            Chats
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChatClick}
              disabled={isCreatingChat}
              className={`px-3 py-1 rounded-lg dark:bg-gray-800 dark:hover:bg-gray-500 hover:scale-[1.03] hover:bg-gray-300 shadow-md bg-white text-black dark:text-white transition duration-300 ease-in-out ${
                isCreatingChat ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCreatingChat ? 'Creating...' : 'New Chat'}
            </button>
            <button
              onClick={toggleChatList}
              className="block md:hidden px-3 py-1 rounded-lg transition duration-300 ease-in-out"
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`relative flex items-center justify-between p-4 border-b text-center text-black dark:text-white transition duration-500 ease-in-out ${
                selectedChat?.id === chat.id
                  ? "bg-gray-300 dark:bg-gray-600"
                  : ""
              }`}
            >
              <button
                type="button"
                onClick={() => handleChatSelection(chat)}
                className="truncate w-full text-left md:max-w-[210px]"
              >
                {chat.title || "New Chat"}
              </button>
              <div className="relative mx-1">
                <button
                  type="button"
                  onClick={() => confirmDeleteChat(chat)}
                  aria-label="Delete Chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the chat{" "}
              <span className="font-bold">
                {chatToDelete?.title || "New Chat"}
              </span>
              ?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setChatToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition duration-300 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleChatDeletion}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
