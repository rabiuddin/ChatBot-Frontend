import { decryptData } from '../config/encryption.config.js';

export const handleResponse = (response) => {
    const { success, data, error, statusCode } = response;
    console.log(response);

    console.log("Error in handleResponse: ", error);

    if (!success) {
        return {
            success,
            data,
            error,
            statusCode
        };
    }

    const decryptedData = decryptData(data);

    return {
        success,
        data: decryptedData,
        error,
        statusCode
    };
};

export const handleMsgChatResponse = (response) => {
    const { success, data, error, statusCode } = response;

    console.log("Error in handleMsgChatResponse: ", error);

    console.log("Response Data: ", data);

    if (!success) {
        return {
            success,
            data,
            error,
            statusCode
        };
    }

    return {
        success,
        data: data,
        error,
        statusCode
    };
}
