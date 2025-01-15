import axios from '../config/axios.config.js';
import { encryptData } from '../config/encryption.config.js';
import { handleResponse } from './handle_response.utils.js';

export const sendRequest = async (endpoint, data) => {
    try {
        const encryptedPrompt = encryptData(data.prompt);
        const response = await axios.post(endpoint, { prompt: encryptedPrompt, model: data.model });
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
