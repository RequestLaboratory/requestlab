import { useState, useEffect } from 'react';
import { compareJson, formatJson, isValidJson } from '../utils/jsonDiff';
import { decodeJsonFromUrl } from '../utils/urlUtils';
import { JsonDiff } from '../types';

export const useJsonComparison = () => {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [diff, setDiff] = useState<JsonDiff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leftValid, setLeftValid] = useState(true);
  const [rightValid, setRightValid] = useState(true);

  // Load from URL params on initial render
  useEffect(() => {
    const { leftJson, rightJson } = decodeJsonFromUrl();
    
    if (leftJson) {
      setLeftInput(leftJson);
      setLeftValid(isValidJson(leftJson));
    }
    
    if (rightJson) {
      setRightInput(rightJson);
      setRightValid(isValidJson(rightJson));
    }

    // If both are valid, compute the diff
    if (leftJson && rightJson && isValidJson(leftJson) && isValidJson(rightJson)) {
      const result = compareJson(leftJson, rightJson);
      if (result.error) {
        setError(result.error);
      } else {
        setDiff(result.diff);
        setError(null);
      }
    }
  }, []);

  const updateLeftJson = (json: string) => {
    setLeftInput(json);
    setLeftValid(isValidJson(json));
    
    if (isValidJson(json) && isValidJson(rightInput)) {
      const result = compareJson(json, rightInput);
      if (result.error) {
        setError(result.error);
      } else {
        setDiff(result.diff);
        setError(null);
      }
    } else {
      setDiff(null);
    }
  };

  const updateRightJson = (json: string) => {
    setRightInput(json);
    setRightValid(isValidJson(json));
    
    if (isValidJson(leftInput) && isValidJson(json)) {
      const result = compareJson(leftInput, json);
      if (result.error) {
        setError(result.error);
      } else {
        setDiff(result.diff);
        setError(null);
      }
    } else {
      setDiff(null);
    }
  };

  const formatLeftJson = () => {
    if (isValidJson(leftInput)) {
      setLeftInput(formatJson(leftInput));
    }
  };

  const formatRightJson = () => {
    if (isValidJson(rightInput)) {
      setRightInput(formatJson(rightInput));
    }
  };

  return {
    leftInput,
    rightInput,
    diff,
    error,
    leftValid,
    rightValid,
    updateLeftJson,
    updateRightJson,
    formatLeftJson,
    formatRightJson,
  };
};