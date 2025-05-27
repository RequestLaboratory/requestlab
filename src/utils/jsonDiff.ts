import * as jsondiffpatch from 'jsondiffpatch';
import { JsonDiff } from '../types';

// Create formatter instance
const formatter = jsondiffpatch.create({
  propertyFilter: (name: string) => name !== '$$hashKey',
  objectHash: (obj: any) => {
    return typeof obj._id === 'string' ? obj._id : JSON.stringify(obj);
  },
  arrays: {
    detectMove: true,
    includeValueOnMove: false,
  },
  textDiff: {
    minLength: 60,
  },
});

const processDiff = (diff: any): JsonDiff | null => {
  if (!diff) return null;

  const result: JsonDiff = {};
  
  // Process each key in the diff
  Object.entries(diff).forEach(([key, value]) => {
    // Skip value changes (0), only track field additions (1) and removals (2)
    if (key === '0') return;
    
    if (key === '1') {
      result.added = true;
    } else if (key === '2') {
      result.removed = true;
    } else if (typeof value === 'object') {
      const childDiff = processDiff(value);
      if (childDiff) {
        result.children = result.children || {};
        result.children[key] = childDiff;
      }
    }
  });

  return Object.keys(result).length > 0 ? result : null;
};

export const compareJson = (left: string, right: string): {
  diff: JsonDiff | null;
  leftJson: any;
  rightJson: any;
  error?: string;
} => {
  try {
    // Parse JSON strings
    const leftJson = JSON.parse(left || '{}');
    const rightJson = JSON.parse(right || '{}');

    // Generate the diff
    const rawDiff = formatter.diff(leftJson, rightJson);
    const processedDiff = processDiff(rawDiff);

    return { diff: processedDiff, leftJson, rightJson };
  } catch (error) {
    return {
      diff: null,
      leftJson: null,
      rightJson: null,
      error: (error as Error).message,
    };
  }
};

export const formatJson = (jsonString: string): string => {
  try {
    const parsedJson = JSON.parse(jsonString);
    return JSON.stringify(parsedJson, null, 2);
  } catch (error) {
    return jsonString;
  }
};

export const isValidJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch (error) {
    return false;
  }
};