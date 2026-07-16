export interface QuranWord {
  id: number;
  position: number;
  text_uthmani: string;
  line_number: number;
  page_number: number;
  char_type_name: string; // 'word' | 'end'
}

export interface QuranVerse {
  id: number;
  verse_key: string;
  words: QuranWord[];
}

let quranCache: Record<number, QuranVerse[]> | null = null;

export const fetchQuranPage = async (page: number): Promise<QuranVerse[]> => {
  if (!quranCache) {
    const url = '/data/quran.json';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Kuran verisi alınamadı.');
    }
    quranCache = await response.json();
  }
  return quranCache![page];
};

export interface VerseAudio {
  verse_key: string;
  audio: { url: string };
}

export const fetchVerseAudioByPage = async (page: number): Promise<VerseAudio[]> => {
  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?audio=7`;
  const response = await fetch(url);
  const data = await response.json();
  return data.verses;
};

export interface VerseTranslation {
  verse_key: string;
  translations: { id: number; resource_id: number; text: string }[];
}

export const fetchTranslationsByPage = async (page: number): Promise<VerseTranslation[]> => {
  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?translations=77`;
  const response = await fetch(url);
  const data = await response.json();
  return data.verses;
};

export const fetchWordTranslationsByPage = async (page: number) => {
  const url = `https://api.quran.com/api/v4/verses/by_page/${page}?language=tr&words=true&word_fields=translation`;
  const response = await fetch(url);
  const data = await response.json();
  return data.verses;
};
