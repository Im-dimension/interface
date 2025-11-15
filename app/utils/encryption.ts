

/**
 * Generate a random secret key for encryption
 * @param length Length of the secret in bytes
 * @returns Uint8Array containing random bytes
 */
export function generateSecret(length: number = 32): Uint8Array {
  const secret = new Uint8Array(length);
  crypto.getRandomValues(secret);
  return secret;
}

/**
 * XOR encryption/decryption (symmetric operation)
 * @param data Data to encrypt/decrypt as Uint8Array
 * @param secret Secret key as Uint8Array
 * @returns Encrypted/decrypted data as Uint8Array
 */
export function xorEncryptDecrypt(data: Uint8Array, secret: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ secret[i % secret.length];
  }
  return result;
}

/**
 * Encrypt a string using XOR encryption
 * @param plaintext String to encrypt
 * @param secret Secret key as Uint8Array
 * @returns Encrypted data as Uint8Array
 */
export function encryptString(plaintext: string, secret: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  return xorEncryptDecrypt(data, secret);
}

/**
 * Decrypt encrypted data to string
 * @param encryptedData Encrypted data as Uint8Array
 * @param secret Secret key as Uint8Array
 * @returns Decrypted string
 */
export function decryptToString(encryptedData: Uint8Array, secret: Uint8Array): string {
  const decrypted = xorEncryptDecrypt(encryptedData, secret);
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Convert Uint8Array to hex string
 * @param bytes Uint8Array to convert
 * @returns Hex string with 0x prefix
 */
export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 * @param hex Hex string (with or without 0x prefix)
 * @returns Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Hash data using SHA-256 (keccak256 equivalent for client-side)
 * Note: For actual blockchain use, the secret hash should be computed with keccak256
 * This is a placeholder - you'll need to use a proper keccak256 library like ethers.js
 * @param data Data to hash as Uint8Array
 * @returns Hash as hex string with 0x prefix
 */
export async function hashSecret(secret: Uint8Array): Promise<string> {
  // Using crypto.subtle.digest for demonstration
  // In production, use keccak256 from ethers.js or similar
  const hashBuffer = await crypto.subtle.digest('SHA-256', secret);
  const hashArray = new Uint8Array(hashBuffer);
  return bytesToHex(hashArray);
}

/**
 * Convert Uint8Array to base64 string for storage/transmission
 */
export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 string back to Uint8Array
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
