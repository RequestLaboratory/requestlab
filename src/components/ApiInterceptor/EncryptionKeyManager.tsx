import React, { useState } from 'react';
import { KeyIcon, ClipboardIcon, CheckIcon, ExclamationTriangleIcon, ShieldCheckIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useEncryption } from '../../contexts/EncryptionContext';
import { toast } from 'react-toastify';

interface EncryptionKeyManagerProps {
  onKeySet?: () => void;
}

export default function EncryptionKeyManager({ onKeySet }: EncryptionKeyManagerProps) {
  const { 
    isEncryptionEnabled, 
    encryptionKey, 
    generateNewKey, 
    setKey, 
    clearKey,
    validateKey 
  } = useEncryption();

  const [pasteMode, setPasteMode] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [inputError, setInputError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleGenerateKey = async () => {
    try {
      const newKey = await generateNewKey();
      toast.success('Encryption key generated! Copy and save it securely.');
      setShowKey(true);
      onKeySet?.();
    } catch (error) {
      toast.error('Failed to generate encryption key');
    }
  };

  const handleSetKey = () => {
    setInputError('');
    
    if (!inputKey.trim()) {
      setInputError('Please enter an encryption key');
      return;
    }

    if (!validateKey(inputKey.trim())) {
      setInputError('Invalid key format. Please enter a valid 256-bit encryption key.');
      return;
    }

    const success = setKey(inputKey.trim());
    if (success) {
      toast.success('Encryption key set successfully!');
      setInputKey('');
      setPasteMode(false);
      onKeySet?.();
    } else {
      setInputError('Failed to set encryption key');
    }
  };

  const handleCopyKey = async () => {
    if (!encryptionKey) return;
    
    try {
      await navigator.clipboard.writeText(encryptionKey);
      setCopied(true);
      toast.success('Key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy key');
    }
  };

  const handleClearKey = () => {
    if (confirm('Are you sure you want to remove the encryption key? You will not be able to decrypt previously encrypted logs without this key.')) {
      clearKey();
      toast.info('Encryption key removed');
    }
  };

  // Key is set - show management UI
  if (isEncryptionEnabled && encryptionKey) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
              End-to-End Encryption Enabled
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Your API request/response data is encrypted before being stored. Only you can decrypt it with your key.
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Encryption Key:</span>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {showKey ? encryptionKey : '••••••••••••••••••••••••••••••••••••••••••••'}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="Copy key"
                >
                  {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2 mb-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-start gap-1">
                <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> Save this key securely! If you lose it, you won't be able to decrypt your stored data. The key is only stored in your browser.
                </span>
              </p>
            </div>

            <button
              onClick={handleClearKey}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              <TrashIcon className="w-4 h-4 mr-1.5" />
              Remove Encryption Key
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No key set - show setup UI
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <KeyIcon className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-1">
            Enable End-to-End Encryption
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
            Protect your API request/response data with encryption. The key is stored only in your browser - 
            even if our database is compromised, your data remains secure.
          </p>

          {!pasteMode ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleGenerateKey}
                className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Generate New Key
              </button>
              <button
                onClick={() => setPasteMode(true)}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 font-medium rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors"
              >
                <ClipboardIcon className="w-4 h-4 mr-2" />
                Paste Existing Key
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setInputError('');
                  }}
                  placeholder="Paste your encryption key here..."
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    inputError 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {inputError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{inputError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSetKey}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Set Key
                </button>
                <button
                  onClick={() => {
                    setPasteMode(false);
                    setInputKey('');
                    setInputError('');
                  }}
                  className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-600 dark:text-orange-400">
              <strong>How it works:</strong> Your encryption key never leaves your browser. Data is encrypted 
              before being sent to our servers and can only be decrypted with your key.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

