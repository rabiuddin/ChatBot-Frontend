import React, { useState, useEffect } from 'react';
import { addChat, getChats, getMessages } from '../utils/handle_request.utils';
import { handleNewChat } from '../utils/chats.utils';

export default function Chats({ toggleChatList, chats, setChats, selectedChat, setSelectedChat, setMessages, messages, setIsFetchingMessages }) {

    const addMessage = (text, isUser) => {
        setMessages((prevMessages) => [...prevMessages, { text, isUser }]);
    };

    useEffect(() => {
        const fetchMessages = async () => {
            setMessages([]);
            setIsFetchingMessages(true);
            if (selectedChat !== null) {
                try {
                    const response = await getMessages(`/api/messages/${selectedChat.id}`);
                    if (response.success) {
                        response.data.forEach((message) => {
                            addMessage(message.HumanMessage, true);
                            addMessage(message.AIMessage, false);
                        });
                    } else {
                        console.error('Error getting messages:', response.error);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
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

    return (
        <div className="h-full bg-white dark:bg-gray-700 overflow-y-auto transition duration-500 ease-in-out">
            <div className=" mx-auto text-nowrap">
                <div className="flex justify-between items-center mb-4 px-4 sticky top-0 bg-white dark:bg-gray-700 py-4 transition duration-500 ease-in-out">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white transition duration-500 ease-in-out">Chats</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handleNewChat(setChats, setSelectedChat)} className="px-3 py-1 rounded-lg dark:bg-gray-800 dark:hover:bg-gray-500 hover:scale-[1.03] hover:bg-gray-300 shadow-md bg-white text-black dark:text-white transition duration-300 ease-in-out">
                            New Chat
                        </button>
                        <button onClick={toggleChatList} className="block md:hidden px-3 py-1 rounded-lg transition duration-300 ease-in-out">
                            <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto h-[calc(100%-64px)]">
                    {chats.map((chat, index) => (
                        <div key={index} className={`p-4 border-b border-gray-300 dark:border-gray-600 text-black dark:text-white transition duration-500 ease-in-out text-center ${selectedChat === null ? '' : selectedChat.id === chat.id ? 'bg-gray-300 dark:bg-gray-600' : ''}`}>
                            <button 
                                onClick={() => handleChatSelection(chat)}
                                className='w-full truncate md:max-w-[210px]'    
                            >
                                {chat.title? chat.title : 'New Chat'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}