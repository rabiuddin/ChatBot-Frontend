import axios from '../config/axios.config.js';
import { encryptData } from '../config/encryption.config.js';
import { handleResponse, handleMsgChatResponse } from './handle_response.utils.js';

export const sendRequest = async (endpoint, data) => {
    try {
        const encryptedPrompt = encryptData(data.prompt);
        const response = await axios.post(endpoint, { prompt: encryptedPrompt, model: data.model, chatID: data.chatID });
        return handleResponse(response.data);
    } catch (error) {
        console.error('Error sending request:', error);
        return {
            success: false,
            data: null,
            error: "Sorry our AI facilities are currently down, please try again later.",
            statusCode: 500
        };
    }
};

export const getChats = async (endpoint) => {
    try {
        const response = await axios.get(endpoint);
        return handleMsgChatResponse(response.data);
    } catch (error) {
        console.error('Error getting messages:', error);
        return {
            success: false,
            data: null,
            error: "Sorry our AI facilities are currently down, please try again later. Error getting messages.",
            statusCode: 500
        };
    }
}

export const getMessages = async (endpoint, chatID) => {
    try {
        const response = await axios.get(endpoint, { chatID });
        return handleMsgChatResponse(response.data);
    } catch (error) {
        console.error('Error getting messages:', error);
        return {
            success: false,
            data: null,
            error: "Sorry our AI facilities are currently down, please try again later. Error getting messages.",
            statusCode: 500
        };
    }
}

export const addChat = async (endpoint) => {
    try {
        const response = await axios.post(endpoint);
        return handleMsgChatResponse(response.data);
    } catch (error) {
        console.error('Error adding chat:', error);
        return {
            success: false,
            data: null,
            error: "Sorry our AI facilities are currently down, please try again later. Error adding chat.",
            statusCode: 500
        };
    }
};
