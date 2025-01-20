import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// JSON data for model names and values
const models = {
    "GPT-4": "gpt-4",
    "Gemini": "gemini-1.5-flash",
    "MergeStack AI": "mergestack-assistant",
    "Fine Tuned GPT": "ft:gpt-4o-mini-2024-07-18:mergestack:sarcasm-detector:ArfxWUAV",
    "Fine Tuned Gemini": "tunedModels/sarcastic-ai-sn3f6oecag98"
};

export default function Navbar({ selectedModel, setSelectedModel }) {
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
        <nav className="bg-gray-200 dark:bg-gray-800 transition duration-500 ease-in-out shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="font-extrabold text-3xl text-gray-800 dark:text-white fixed top-4 left-5 transition duration-500 ease-in-out">ChatBot</span>
                    </div>
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
                </div>
            </div>
        </nav>
    );
}