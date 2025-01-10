import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub-flavored markdown (optional)

export default function Message({ text, isUser }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            {!isUser && (
                <div className="flex items-center justify-center min-w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full mr-2 transition duration-500 ease-in-out mt-1">
                    AI
                </div>
            )}
            <div
                className={`max-w-xl px-4 py-2 rounded-lg break-words whitespace-pre-wrap transition duration-500 ease-in-out ${
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                }`}
                style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                }}
            >
                <ReactMarkdown
                    children={text}
                    remarkPlugins={[remarkGfm]} 
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            return inline ? (
                                <code
                                    className={`bg-gray-200 dark:bg-gray-800 text-sm px-1 rounded transition duration-500 ease-in-out ${
                                        isUser ? 'text-white' : 'text-gray-800 dark:text-white'
                                    }`}
                                    style={{
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                    {...props}
                                >
                                    {children}
                                </code>
                            ) : (
                                <pre
                                    className={`overflow-x-auto p-2 rounded transition duration-500 ease-in-out ${
                                        isUser ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
                                    }`}
                                    style={{
                                        whiteSpace: 'pre-wrap', // Ensure wrapping
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                    {...props}
                                >
                                    <code className="transition duration-500 ease-in-out text-gray-800 dark:text-white">{children}</code>
                                </pre>
                            );
                        },
                    }}
                />
            </div>
        </motion.div>
    );
}
