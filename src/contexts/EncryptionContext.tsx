import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  generateEncryptionKey,
  saveEncryptionKey,
  getEncryptionKey,
  removeEncryptionKey,
  isValidKeyFormat,
  encryptData,
  decryptData,
} from '../utils/encryption';

interface EncryptionContextType {
  // State
  isEncryptionEnabled: boolean;
  encryptionKey: string | null;
  isKeySetupComplete: boolean;
  
  // Actions
  generateNewKey: () => Promise<string>;
  setKey: (key: string) => boolean;
  clearKey: () => void;
  
  // Encryption/Decryption helpers
  encrypt: (data: string | object) => Promise<string>;
  decrypt: (encryptedData: string) => Promise<string>;
  
  // Validation
  validateKey: (key: string) => boolean;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const [isKeySetupComplete, setIsKeySetupComplete] = useState(false);

  // Load key from localStorage on mount
  useEffect(() => {
    const storedKey = getEncryptionKey();
    if (storedKey && isValidKeyFormat(storedKey)) {
      setEncryptionKey(storedKey);
    }
    setIsKeySetupComplete(true);
  }, []);

  const isEncryptionEnabled = encryptionKey !== null && isValidKeyFormat(encryptionKey);

  const generateNewKey = useCallback(async (): Promise<string> => {
    const newKey = await generateEncryptionKey();
    setEncryptionKey(newKey);
    saveEncryptionKey(newKey);
    return newKey;
  }, []);

  const setKey = useCallback((key: string): boolean => {
    if (!isValidKeyFormat(key)) {
      return false;
    }
    setEncryptionKey(key);
    saveEncryptionKey(key);
    return true;
  }, []);

  const clearKey = useCallback(() => {
    setEncryptionKey(null);
    removeEncryptionKey();
  }, []);

  const encrypt = useCallback(async (data: string | object): Promise<string> => {
    if (!encryptionKey) {
      throw new Error('Encryption key not set');
    }
    return encryptData(data, encryptionKey);
  }, [encryptionKey]);

  const decrypt = useCallback(async (encryptedData: string): Promise<string> => {
    if (!encryptionKey) {
      throw new Error('Encryption key not set');
    }
    return decryptData(encryptedData, encryptionKey);
  }, [encryptionKey]);

  const validateKey = useCallback((key: string): boolean => {
    return isValidKeyFormat(key);
  }, []);

  const value: EncryptionContextType = {
    isEncryptionEnabled,
    encryptionKey,
    isKeySetupComplete,
    generateNewKey,
    setKey,
    clearKey,
    encrypt,
    decrypt,
    validateKey,
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption(): EncryptionContextType {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}

export default EncryptionContext;

