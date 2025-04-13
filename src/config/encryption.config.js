import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
const IV = import.meta.env.VITE_IV;

export const encryptData = (data) => {
    const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Hex.parse(IV);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv: iv });
    return encrypted.toString();
};

export const decryptData = (ciphertext) => {
    const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
    const iv = CryptoJS.enc.Hex.parse(IV);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, { iv: iv });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};

