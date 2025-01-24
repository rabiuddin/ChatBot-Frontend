import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../config/axios.config.js';
import microphoneImage from '../assets/microphone.png';
import arrowImage from '../assets/arrow.png';
import { handleResponse } from '../utils/handle_response.utils.js';
import { sendRequest } from '../utils/handle_request.utils.js';

export default function Input({ 
    onSend, 
    selectedModel, 
    isLoading, 
    setIsLoading,
    isUserLoading,
    setIsUserLoading,
    isRecording, 
    setIsRecording,
    selectedChat,
    setSelectedChat,
    setChats
}) {
    const [message, setMessage] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const textareaRef = useRef(null);
    const [audioLevel, setAudioLevel] = useState([0, 0, 0]);
    const analyzerRef = useRef(null);
    const animationFrameRef = useRef(null);

    const updateAudioLevel = () => {
        if (analyzerRef.current) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            
            // Get three frequency ranges (low, mid, high)
            const chunks = Math.floor(dataArray.length / 3);
            const levels = [
                dataArray.slice(0, chunks).reduce((a, b) => a + b, 0) / chunks,
                dataArray.slice(chunks, chunks * 2).reduce((a, b) => a + b, 0) / chunks,
                dataArray.slice(chunks * 2).reduce((a, b) => a + b, 0) / chunks
            ].map(val => val / 255); // Normalize to 0-1
            
            setAudioLevel(levels);
            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
    };

    const saveMessages = async (HumanMessage, AIMessage) => {
        let chatID = selectedChat.id;

        const response = await axios.post("/api/messages", { ChatID: chatID, HumanMessage: HumanMessage, AIMessage: AIMessage });

        if (!response.data.success) {
            console.error('Error adding message to chat:', response.error);
        } else {
            console.log("Message added to chat");
        }
    }

    const setChatTitle = async (HumanMessage) => {
        if (selectedChat.title === null){
            let chatID = selectedChat.id;
            const response = await axios.get(`/api/chats/title-summary/${HumanMessage}`);
            if (!response.data.success) {
                console.error('Error getting title for chat:', response.error);
            } else {
                const title = response.data.data;
                
                setChats((prevChats) => {
                    const newChats = [...prevChats];
                    const chatIndex = newChats.findIndex((chat) => chat.id === chatID);
                    newChats[chatIndex] = { ...newChats[chatIndex], title: title };
                    return newChats;
                });

                // Save the title in the database
                try {
                    await axios.put(`/api/chats?chatID=${chatID}&title=${title}`);
                } catch (error) {
                    console.error('Error saving title to database:', error);
                }
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message, true); 
            setIsLoading(true);
            setMessage('');
            try {
                const endpoint = selectedModel === "mergestack-assistant" ? "/api/mergestack-assistant" : "/api/chat-completion";
                const handledResponse = await sendRequest(endpoint, { prompt: message, model: selectedModel, chatID: selectedChat.id });
                if (!handledResponse.success) {
                    onSend(handledResponse.error, false);
                } else {
                    onSend(handledResponse.data, false);
                    saveMessages(message, handledResponse.data);
                    setChatTitle(message);
                }
                setIsUserLoading(false);
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
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            source.connect(analyzer);
            analyzerRef.current = analyzer;
            
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            const chunks = [];
    
            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };
    
            recorder.onstop = async () => {
                cancelAnimationFrame(animationFrameRef.current);
                analyzerRef.current = null;
                audioContext.close();
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
                    const handledResponse = handleResponse(response.data);
                    setIsUserLoading(false);
                    let message = handledResponse.data;
                    onSend(message, true);

                    setIsLoading(true);
                    const endpoint = selectedModel === "mergestack-assistant" ? "/api/mergestack-assistant":"/api/chat-completion";
                    const handledRes = await sendRequest(endpoint, { prompt: message, model: selectedModel, chatID: selectedChat.id });
                    if (!handledRes.success) {
                        onSend(handledRes.error, false);
                    } else {
                        onSend(handledRes.data, false);
                    }

                } catch (error) {
                    console.error('Error processing audio:', error);
                } finally {
                    setIsLoading(false);
                    stream.getTracks().forEach(track => track.stop());
                }
            };
    
            recorder.start();
            setIsRecording(true);
            updateAudioLevel();
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
                    <img
                        src={arrowImage}
                        alt="Arrow"
                        className="size-8 text-white"
                        style={{ filter: 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)' }}
                    />
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
                    <div className="h-32 flex items-center justify-center space-x-3 mb-8">
                        {[0, 1, 2].map((index) => (
                            <div key={index} className="h-full flex items-center">
                                <motion.div
                                    className="w-4 bg-red-500 rounded-full"
                                    animate={{
                                        height: Array.isArray(audioLevel) 
                                            ? `${4 + (audioLevel[index] * 96)}px` // Transforms from 4px dot to max 100px line
                                            : '4px',
                                        borderRadius: Array.isArray(audioLevel)
                                            ? audioLevel[index] > 0.1 ? '4px' : '50%' // Changes from circle to rounded rectangle
                                            : '50%',
                                        backgroundColor: [
                                            "rgb(239, 68, 68)",
                                            `rgb(${Math.max(239 - (Array.isArray(audioLevel) ? audioLevel[index] * 200 : 0), 100)}, 68, 68)`
                                        ]
                                    }}
                                    transition={{
                                        duration: 0.05,
                                        ease: "linear"
                                    }}
                                    style={{
                                        boxShadow: `0 0 10px rgba(239, 68, 68, ${Array.isArray(audioLevel) ? 0.3 + audioLevel[index] * 0.7 : 0.3})`
                                    }}
                                />
                            </div>
                        ))}
                    </div>
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