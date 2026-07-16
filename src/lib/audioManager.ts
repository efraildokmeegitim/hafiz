const CACHE_NAME = 'hafiz-audio-cache-v1';

export const getCachedAudioUrl = async (url: string): Promise<string> => {
  if (typeof window === 'undefined') return url;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error("Cache error:", error);
  }
  return url; // fallback to network
};

export const downloadAudioFile = async (url: string): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (!response) {
      await cache.add(url);
    }
  } catch (error) {
    console.error("Failed to download audio:", error);
    throw error;
  }
};

export const clearAudioCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  await caches.delete(CACHE_NAME);
};

export const checkCacheSize = async (): Promise<number> => {
  if (typeof window === 'undefined') return 0;
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    // Getting exact byte size is complex via Cache API directly without reading blobs,
    // so we return the number of files.
    return keys.length;
  } catch (error) {
    return 0;
  }
};
