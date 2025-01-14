import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Message from './Message';
import Input from './Input';
import ThemeToggle from './ThemeToggle';
import Navbar from './Navbar';
import Loader from './Loader';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('isDarkMode');
        return saved ? JSON.parse(saved) : false;
    });
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = localStorage.getItem('selectedModel');
        return saved || 'gpt-4';
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const addMessage = (text, isUser) => {
        setMessages((prevMessages) => [...prevMessages, { text, isUser }]);
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

    return (
        <div className="h-screen flex flex-col">
            <div className="fixed top-0 left-0 right-0 z-10">
                <Navbar selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
                <div className="border-b border-gray-300 dark:border-gray-600 transition duration-500 ease-in-out"></div>
            </div>

            <div className="flex-1 bg-gray-200 dark:bg-gray-800 transition duration-500 ease-in-out overflow-hidden pt-16 pb-24">
                <div className="h-full overflow-y-auto">
                    <div className="max-w-2xl mx-auto p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {messages.map((message, index) => (
                                <Message key={index} text={message.text} isUser={message.isUser} />
                            ))}
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

            <div className="fixed bottom-0 left-0 right-0 bg-gray-200 dark:bg-gray-800 p-4 transition duration-500 ease-in-out">
                <div className="max-w-2xl mx-auto">
                    <Input 
                        onSend={addMessage} 
                        selectedModel={selectedModel} 
                        isLoading={isLoading} 
                        setIsLoading={setIsLoading}
                        isUserLoading={isUserLoading}
                        setIsUserLoading={setIsUserLoading}
                        isRecording={isRecording}
                        setIsRecording={setIsRecording}
                    />
                </div>
            </div>

            <div className="fixed top-3 right-4 z-20">
                <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            </div>
        </div>
    );
}