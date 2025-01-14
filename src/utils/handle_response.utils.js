import { decryptData } from '../config/encryption.config.js';

export const handleResponse = (response) => {
    const { success, data, error, statusCode } = response;
    console.log(response);

    if (!success) {
        throw new Error(error || 'Unknown error occurred');
    }

    const decryptedData = decryptData(data);

    return {
        success,
        data: decryptedData,
        error,
        statusCode
    };
};
