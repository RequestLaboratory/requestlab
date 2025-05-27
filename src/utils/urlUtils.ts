import LZString from 'lz-string';

export const encodeJsonToUrl = (leftJson: string, rightJson: string): string => {
  const compressedLeft = LZString.compressToEncodedURIComponent(leftJson);
  const compressedRight = LZString.compressToEncodedURIComponent(rightJson);
  
  return `${window.location.origin}${window.location.pathname}?left=${compressedLeft}&right=${compressedRight}`;
};

export const decodeJsonFromUrl = (): { leftJson: string; rightJson: string } => {
  const params = new URLSearchParams(window.location.search);
  
  const compressedLeft = params.get('left') || '';
  const compressedRight = params.get('right') || '';
  
  const leftJson = compressedLeft ? 
    LZString.decompressFromEncodedURIComponent(compressedLeft) || '' : 
    '';
  
  const rightJson = compressedRight ? 
    LZString.decompressFromEncodedURIComponent(compressedRight) || '' : 
    '';
  
  return { leftJson, rightJson };
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
};