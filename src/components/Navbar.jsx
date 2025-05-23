import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

// JSON data for model names and values
const models = {
    "Gemini": "gemini-1.5-flash",
    "Sarcastic Gemini": "tunedModels/sarcastic-ai-sn3f6oecag98"
};

export default function Navbar({ selectedModel, setSelectedModel, isDarkMode, setIsDarkMode, toggleChatList, isChatListVisible }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleOptionChange = (value) => {
        setSelectedModel(value);
        setIsDropdownOpen(false); // Close dropdown after selection
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <nav className="bg-gray-200 dark:bg-gray-800 transition duration-500 ease-in-out shadow-md h-28 sm:h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 flex-col sm:flex-row">
                    <div className="flex items-center">
                        <button onClick={toggleChatList} className="mr-8 sm:block">
                            <svg className="w-6 h-6 text-gray-800 dark:text-white transition duration-500 ease-in-out" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {isChatListVisible ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                                )}
                            </svg>
                        </button>
                        <span className="font-extrabold text-3xl text-gray-800 dark:text-white my-3 transition duration-500 ease-in-out">ChatBot</span>
                    </div>
                    <div className='flex flex-row items-center'>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={handleDropdownToggle}
                                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white mr-14 transition duration-300 ease-in-out transform hover:scale-[1.03] hover:bg-gray-400 dark:hover:bg-gray-600 "
                            >
                                {Object.keys(models).find(key => models[key] === selectedModel)}
                            </button>
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-700 z-50"
                                    >
                                        {Object.entries(models).map(([name, value]) => (
                                            <div
                                                key={value}
                                                onClick={() => handleOptionChange(value)}
                                                className="px-4 py-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 dark:text-white transition duration-300 ease-in-out"
                                            >
                                                {name}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="">
                            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}