/**
 * End-to-End Encryption Utility for API Interceptor
 * Uses AES-GCM (256-bit) for symmetric encryption
 * Key is stored only on the frontend - never sent to backend
 */

// Convert string to Uint8Array
function stringToArrayBuffer(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert Uint8Array to string
function arrayBufferToString(buffer: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate a random 256-bit encryption key
 * Returns the key as a base64-encoded string for storage
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exportedKey);
}

/**
 * Import a base64-encoded key string into a CryptoKey
 */
async function importKey(keyString: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyString);
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable after import
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 * @param data - The data to encrypt (string or object)
 * @param keyString - The base64-encoded encryption key
 * @returns Encrypted data as base64 string (includes IV)
 */
export async function encryptData(data: string | object, keyString: string): Promise<string> {
  try {
    const key = await importKey(keyString);
    
    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataBuffer = stringToArrayBuffer(dataString);
    
    // Generate a random 12-byte IV for each encryption
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    
    // Encrypt the data - use buffer slice to get ArrayBuffer
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer.slice(0) as ArrayBuffer,
      },
      key,
      dataBuffer.buffer.slice(0) as ArrayBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Return as base64 - use slice to get a proper ArrayBuffer
    return arrayBufferToBase64(combined.buffer.slice(0));
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using AES-GCM
 * @param encryptedData - The base64-encoded encrypted data (includes IV)
 * @param keyString - The base64-encoded encryption key
 * @returns Decrypted data as string
 */
export async function decryptData(encryptedData: string, keyString: string): Promise<string> {
  try {
    const key = await importKey(keyString);
    
    // Convert from base64
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedData));
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    // Decrypt the data - convert to ArrayBuffer to satisfy TypeScript
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv.buffer as ArrayBuffer,
      },
      key,
      data.buffer as ArrayBuffer
    );
    
    return arrayBufferToString(new Uint8Array(decryptedBuffer));
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. The encryption key may be incorrect.');
  }
}

/**
 * Validate if a string is a valid encryption key format
 */
export function isValidKeyFormat(keyString: string): boolean {
  try {
    // A 256-bit key should be 32 bytes = ~44 base64 characters
    if (!keyString || keyString.length < 40 || keyString.length > 50) {
      return false;
    }
    // Try to decode it
    const decoded = base64ToArrayBuffer(keyString);
    return decoded.byteLength === 32;
  } catch {
    return false;
  }
}

/**
 * Storage key for the encryption key in localStorage
 */
const ENCRYPTION_KEY_STORAGE = 'interceptor_encryption_key';

/**
 * Save encryption key to localStorage (frontend only)
 */
export function saveEncryptionKey(key: string): void {
  localStorage.setItem(ENCRYPTION_KEY_STORAGE, key);
}

/**
 * Get encryption key from localStorage
 */
export function getEncryptionKey(): string | null {
  return localStorage.getItem(ENCRYPTION_KEY_STORAGE);
}

/**
 * Remove encryption key from localStorage
 */
export function removeEncryptionKey(): void {
  localStorage.removeItem(ENCRYPTION_KEY_STORAGE);
}

/**
 * Check if encryption is enabled (key exists)
 */
export function isEncryptionEnabled(): boolean {
  const key = getEncryptionKey();
  return key !== null && isValidKeyFormat(key);
}

/**
 * Encrypt sensitive log fields
 */
export interface EncryptedLogData {
  headers: string;
  body: string;
  response_headers: string;
  response_body: string;
  is_encrypted: boolean;
}

export async function encryptLogData(
  headers: string,
  body: string,
  responseHeaders: string,
  responseBody: string,
  keyString: string
): Promise<EncryptedLogData> {
  return {
    headers: await encryptData(headers, keyString),
    body: body ? await encryptData(body, keyString) : '',
    response_headers: await encryptData(responseHeaders, keyString),
    response_body: responseBody ? await encryptData(responseBody, keyString) : '',
    is_encrypted: true,
  };
}

/**
 * Decrypt sensitive log fields
 */
export async function decryptLogData(
  encryptedData: EncryptedLogData,
  keyString: string
): Promise<{
  headers: string;
  body: string;
  response_headers: string;
  response_body: string;
}> {
  return {
    headers: await decryptData(encryptedData.headers, keyString),
    body: encryptedData.body ? await decryptData(encryptedData.body, keyString) : '',
    response_headers: await decryptData(encryptedData.response_headers, keyString),
    response_body: encryptedData.response_body ? await decryptData(encryptedData.response_body, keyString) : '',
  };
}

