import { useState } from 'react';
import { executeCurl, formatCurlResponse } from '../utils/curlUtils';
import { compareJson } from '../utils/jsonDiff';
import { JsonDiff } from '../types';

export const useCurlComparison = () => {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [leftResponse, setLeftResponse] = useState('');
  const [rightResponse, setRightResponse] = useState('');
  const [diff, setDiff] = useState<JsonDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLeftLoading, setIsLeftLoading] = useState(false);
  const [isRightLoading, setIsRightLoading] = useState(false);

  const executeLeftCurl = async () => {
    setIsLeftLoading(true);
    try {
      const response = await executeCurl(leftInput);
      const formattedResponse = formatCurlResponse(response);
      setLeftResponse(formattedResponse);
      
      if (rightResponse) {
        const result = compareJson(formattedResponse, rightResponse);
        if (result.error) {
          setError(result.error);
        } else {
          setDiff(result.diff);
          setError(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute left cURL');
    } finally {
      setIsLeftLoading(false);
    }
  };

  const executeRightCurl = async () => {
    setIsRightLoading(true);
    try {
      const response = await executeCurl(rightInput);
      const formattedResponse = formatCurlResponse(response);
      setRightResponse(formattedResponse);
      
      if (leftResponse) {
        const result = compareJson(leftResponse, formattedResponse);
        if (result.error) {
          setError(result.error);
        } else {
          setDiff(result.diff);
          setError(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute right cURL');
    } finally {
      setIsRightLoading(false);
    }
  };

  return {
    leftInput,
    rightInput,
    leftResponse,
    rightResponse,
    diff,
    error,
    isLeftLoading,
    isRightLoading,
    setLeftInput,
    setRightInput,
    executeLeftCurl,
    executeRightCurl,
  };
}; 