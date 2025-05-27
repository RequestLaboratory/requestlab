import LZString from 'lz-string';

interface ShareData {
  leftJson: string;
  rightJson: string;
  leftCurl?: string;
  rightCurl?: string;
  mode: 'json' | 'curl';
}

export const encodeJsonToUrl = (data: ShareData): string => {
  const compressedLeft = LZString.compressToEncodedURIComponent(data.leftJson);
  const compressedRight = LZString.compressToEncodedURIComponent(data.rightJson);
  const compressedLeftCurl = data.leftCurl ? LZString.compressToEncodedURIComponent(data.leftCurl) : '';
  const compressedRightCurl = data.rightCurl ? LZString.compressToEncodedURIComponent(data.rightCurl) : '';
  
  const params = new URLSearchParams({
    left: compressedLeft,
    right: compressedRight,
    mode: data.mode
  });

  // Always include cURL parameters when in curl mode
  if (data.mode === 'curl') {
    params.append('leftCurl', compressedLeftCurl);
    params.append('rightCurl', compressedRightCurl);
  }
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const decodeJsonFromUrl = (): ShareData => {
  const params = new URLSearchParams(window.location.search);
  
  const compressedLeft = params.get('left') || '';
  const compressedRight = params.get('right') || '';
  const compressedLeftCurl = params.get('leftCurl') || '';
  const compressedRightCurl = params.get('rightCurl') || '';
  const mode = (params.get('mode') || 'json') as 'json' | 'curl';
  
  const leftJson = compressedLeft ? 
    LZString.decompressFromEncodedURIComponent(compressedLeft) || '' : 
    '';
  
  const rightJson = compressedRight ? 
    LZString.decompressFromEncodedURIComponent(compressedRight) || '' : 
    '';

  const leftCurl = compressedLeftCurl ?
    LZString.decompressFromEncodedURIComponent(compressedLeftCurl) || '' :
    '';

  const rightCurl = compressedRightCurl ?
    LZString.decompressFromEncodedURIComponent(compressedRightCurl) || '' :
    '';
  
  return { leftJson, rightJson, leftCurl, rightCurl, mode };
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