import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Message from './Message';
import Input from './Input';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4'); // Default to Gemini
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const addMessage = (text, isUser) => {
        setMessages((prevMessages) => [...prevMessages, { text, isUser }]);
    };


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        document.documentElement.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    }, [isDarkMode]);

    return (
        <div className="h-screen flex flex-col">
            <Navbar selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
            <div className="border-b border-gray-300 dark:border-gray-600 relative transition duration-500 ease-in-out"></div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-800 p-4 overflow-y-auto relative transition duration-500 ease-in-out ">
                <div className="fixed top-3 right-4">
                    <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                </div>
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {messages.map((message, index) => (
                            <Message key={index} text={message.text} isUser={message.isUser} />
                        ))}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="flex justify-start mb-4"
                            >
                                <div className="flex items-center justify-center w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full mr-2 transition duration-500 ease-in-out">
                                    AI
                                </div>
                                <div className="flex items-center space-x-2">
                                    <motion.div
                                        className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-200 rounded-full"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                    ></motion.div>
                                    <motion.div
                                        className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-200 rounded-full"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                    ></motion.div>
                                    <motion.div
                                        className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-200 rounded-full"
                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                    ></motion.div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="bg-gray-200 dark:bg-gray-800 p-4 transition duration-500 ease-in-out ">
                <div className="max-w-2xl mx-auto">
                    <Input onSend={addMessage} selectedModel={selectedModel} isLoading={isLoading} setIsLoading={setIsLoading}/>
                </div>
            </div>
        </div>
    );
}