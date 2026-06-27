import CryptoJS from 'crypto-js';

const SECRET_KEY = 'mobilecloud-secret-key-change-in-production';

export const encrypt = (data: object): string => {
  const json = JSON.stringify(data);
  return CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
};

export const decrypt = (encrypted: string): object => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return {};
  }
};

export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};
