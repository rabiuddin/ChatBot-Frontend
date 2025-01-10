import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../config/axios.config.js';
import microphoneImage from '../assets/microphone-342.svg';

export default function Input({ 
    onSend, 
    selectedModel, 
    isLoading, 
    setIsLoading,
    isUserLoading,
    setIsUserLoading,
    isRecording, 
    setIsRecording 
}) {
    const [message, setMessage] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const textareaRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim()) {
            setIsUserLoading(true);
            onSend(message, true); 
            setIsLoading(true);
            setMessage('');
            try {

                const endpoint = selectedModel === "mergestack-assistant" ? "/api/mergestack-assistant":"/api/chat-completion";
                const response = await axios.post(endpoint, { prompt: message, model: selectedModel});
                setIsUserLoading(false);
                onSend(response.data.data, false); 
            } catch (error) {
                console.error('Error sending message:', error);
                setIsUserLoading(false);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && !isRecording && !isUserLoading) {
                handleSubmit(e);
            }
        }
    };

    const handleMicClick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            const chunks = [];
    
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
    
            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audio_file', audioBlob, 'recording.wav'); // Ensure the key matches the backend parameter
    
                try {
                    setIsUserLoading(true);
                    const response = await axios.post('/api/speech-assistant', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    setIsUserLoading(false)
                    let message = response.data.data;
                    onSend(message, true);

                    setIsLoading(true);
                    const endpoint = selectedModel === "mergestack-assistant" ? "/api/mergestack-assistant":"/api/chat-completion";
                    const res = await axios.post(endpoint, { prompt: message, model: selectedModel});
                    onSend(res.data.data, false); 

                } catch (error) {
                    console.error('Error processing audio:', error);
                } finally {
                    setIsLoading(false);
                    stream.getTracks().forEach(track => track.stop());
                }
            };
    
            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        setIsRecording(false);
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    return (
        <>
            <form onSubmit={handleSubmit} className="flex items-end">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your query..."
                    className="flex-1 p-4 rounded-3xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none overflow-y-auto transition duration-500 ease-in-out"
                    rows={1}
                    style={{ minHeight: '60px', maxHeight: '160px' }}
                    disabled={false} // Enable typing
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className={`bg-blue-500 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px] w-[40px] flex items-center justify-center ml-2 mb-2 ${
                        (isLoading || isRecording || isUserLoading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading || isRecording || isUserLoading}
                >
                    {(isLoading || isUserLoading) ? (
                        <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    )}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleMicClick}
                    className={`bg-blue-500 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 h-[40px] w-[40px] flex items-center justify-center ml-2 mb-2 ${
                        (isLoading || isRecording || isUserLoading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isLoading || isRecording || isUserLoading}
                >
                    <img
                        src={microphoneImage}
                        alt="Microphone"
                        className="h-6 w-6 text-white"
                        style={{ filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)' }}
                    />
                </motion.button>
            </form>

            {/* Recording Overlay */}
            {isRecording && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex flex-col items-center justify-center pointer-events-auto">
                    <div className="text-white text-2xl mb-8">Listening...</div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-16 h-16 bg-red-500 rounded-full mb-8"
                    />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={stopRecording}
                        className="bg-white text-black px-6 py-2 rounded-full"
                    >
                        Stop Recording
                    </motion.button>
                </div>
            )}
        </>
    );
}