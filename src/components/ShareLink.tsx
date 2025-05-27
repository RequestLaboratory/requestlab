import React, { useState } from 'react';
import { encodeJsonToUrl, copyToClipboard } from '../utils/urlUtils';
import { Link, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface ShareLinkProps {
  leftJson: string;
  rightJson: string;
  isValid: boolean;
}

const ShareLink: React.FC<ShareLinkProps> = ({ leftJson, rightJson, isValid }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!isValid) {
      toast.error('Please enter valid JSON in both panels first');
      return;
    }

    const shareUrl = encodeJsonToUrl(leftJson, rightJson);
    const success = await copyToClipboard(shareUrl);

    if (success) {
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <button
        onClick={handleCopyLink}
        disabled={!isValid}
        className={`
          flex items-center px-4 py-2 rounded-md transition-all duration-300
          ${
            isValid 
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
          }
        `}
      >
        {copied ? (
          <>
            <Check size={16} className="mr-2" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Link size={16} className="mr-2" />
            <span>Copy Share Link</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ShareLink;