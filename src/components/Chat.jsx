import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Message from './Message';
import Input from './Input';
import Navbar from './Navbar';
import Loader from './Loader';
import Chats from './Chats';
import { getChats } from '../utils/handle_request.utils';
import { handleNewChat } from '../utils/chats.utils';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = localStorage.getItem('selectedModel');
        return saved || 'gemini-1.5-flash';
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [isChatListVisible, setIsChatListVisible] = useState(false);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [isFetchingMessages, setIsFetchingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    const addMessage = (text, isUser) => {
        setMessages((prevMessages) => [...prevMessages, { text, isUser }]);
    };

    const toggleChatList = () => {
        setIsChatListVisible(!isChatListVisible);
    };

    const addNewChat = async () => {
        await handleNewChat(setChats, setSelectedChat);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        document.documentElement.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('selectedModel', selectedModel);
    }, [selectedModel]);

    useEffect(() => {
        const fetchChats = async () => {
            const response = await getChats('/api/chats');
            if (response.success) {
                setChats(response.data);
            } else {
                console.error('Error getting chats:', response.error);
            }
        };

        fetchChats();
    }, []);

    return (
        <div className="h-screen flex">
            <div
                className={`h-full z-20 fixed top-0 left-0 md:static transition-all duration-500 ${isChatListVisible ? 'w-full md:w-80' : 'w-0'}`}
            >
                <Chats toggleChatList={toggleChatList} chats={chats} setChats={setChats} selectedChat={selectedChat} setSelectedChat={setSelectedChat} setMessages={setMessages} messages={messages} setIsFetchingMessages={setIsFetchingMessages} />
            </div>

            <div
                className={`flex flex-col w-full`}
            >
                <div className="sticky top-0 z-10">
                    <Navbar 
                        selectedModel={selectedModel} 
                        setSelectedModel={setSelectedModel} 
                        isDarkMode={isDarkMode} 
                        setIsDarkMode={setIsDarkMode} 
                        toggleChatList={toggleChatList} 
                        isChatListVisible={isChatListVisible}
                    />
                </div>

                {/* Main Chat Area */}
                <div className='flex flex-col flex-1 overflow-y-auto'>
                    <div className={`flex-1 bg-gray-200 dark:bg-gray-800 transition duration-500 ease-in-out pb-0 sm:mt-0 flex flex-col`}>
                        <div className="flex-1 ">
                            {
                                messages.length === 0 && !isFetchingMessages && (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="text-center">
                                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white transition duration-500 ease-in-out">Welcome to ChatBot</h1>
                                            <p className="text-gray-500 dark:text-gray-300 transition duration-500 ease-in-out">Select a chat or add a new chat to start conversation</p>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                selectedChat === null && (
                                    <div className="flex justify-center bg-gray-200 dark:bg-gray-800 transition duration-500 ease-in-out">
                                        <button 
                                            onClick={addNewChat} 
                                            className="px-4 py-2 rounded-lg dark:bg-gray-700 dark:hover:bg-gray-500 hover:scale-[1.03] hover:bg-gray-300 shadow-lg bg-white text-black dark:text-white transition duration-500 ease-in-out mb-10 "
                                        >
                                            New Chat
                                        </button>
                                    </div>
                                )
                            }
                            <div className={`max-w-2xl ${messages.length === 0? 'max-w-full': 'mx-auto p-4'} bg-gray-200 dark:bg-gray-800 transition duration-500 ease-in-out`}>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {isFetchingMessages ? (
                                        <div className="flex items-center justify-center h-screen">
                                            <div className="w-12 h-12 border-4 border-gray-400 dark:border-gray-300 dark:border-t-blue-500 border-t-gray-950 rounded-full animate-spin transition duration-500 ease-in-out"></div>
                                      </div>
                                    ) : (
                                        messages.map((message, index) => (
                                            <Message key={index} text={message.text} isUser={message.isUser} />
                                        ))
                                    )}
                                    {isUserLoading && (
                                        <div className="flex justify-end mb-4">
                                            <div className='my-auto'>
                                                <Loader />
                                            </div>
                                        </div>
                                    )}
                                    {isLoading && (
                                        <div className="flex justify-start mb-4">
                                            <div className="flex items-center justify-center w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full mr-2 transition duration-500 ease-in-out">
                                                AI
                                            </div>
                                            <div className='my-auto'>
                                                <Loader/>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-200 dark:bg-gray-800 p-4 transition duration-500 ease-in-out">
                    <div className="max-w-2xl mx-auto">
                        {selectedChat && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className=' '
                            >
                                <Input 
                                    onSend={addMessage} 
                                    selectedModel={selectedModel} 
                                    isLoading={isLoading} 
                                    setIsLoading={setIsLoading}
                                    isUserLoading={isUserLoading}
                                    setIsUserLoading={setIsUserLoading}
                                    isRecording={isRecording}
                                    setIsRecording={setIsRecording}
                                    selectedChat={selectedChat}
                                    messages={messages}
                                    setChats={setChats}
                                />
                            </motion.div>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}