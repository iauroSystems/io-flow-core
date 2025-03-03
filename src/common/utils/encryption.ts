import * as CryptoJS from 'crypto-js';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, process.env.DECRYPTION_SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.DECRYPTION_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}