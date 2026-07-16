"use client";
import { useEffect, useState, useRef } from 'react';
import { fetchQuranPage, QuranVerse, QuranWord, fetchVerseAudioByPage, VerseAudio, fetchTranslationsByPage, VerseTranslation, fetchWordTranslationsByPage } from '@/lib/api';
import { getHafizlikState, saveHafizlikState, PageStatus, scheduleReviewForPage } from '@/lib/storage';
import { useRouter, useParams } from 'next/navigation';
import { Pause, Volume2, Settings, Play, FastForward, Rewind, RefreshCw, Mic, MicOff } from 'lucide-react';
import { getCachedAudioUrl } from '@/lib/audioManager';

export default function MushafClient() {
  const params = useParams();
  const pageNumber = parseInt(params.page as string);
  const router = useRouter();
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [verseAudios, setVerseAudios] = useState<VerseAudio[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<PageStatus | null>(null);

  // V6 Features: Test Mode and Translations
  const [testMode, setTestMode] = useState(false);
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [selectedVerseTrans, setSelectedVerseTrans] = useState<{key: string, text: string} | null>(null);
  const versesRef = useRef<QuranVerse[]>([]);
  const [wordByWordMode, setWordByWordMode] = useState(false);
  const [wordTranslations, setWordTranslations] = useState<Record<number, string>>({});

  // Mode and Settings
  const [mode, setMode] = useState<'dinle' | 'ezber' | 'ai'>('dinle');
  const [repeatCount, setRepeatCount] = useState(3);
  const [reverseMode, setReverseMode] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  // Audio Playback State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<number[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);

  // AI Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [recognizedWords, setRecognizedWords] = useState<Set<number>>(new Set());
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!pageNumber) return;
    const state = getHafizlikState();
    setStatus(state.pages[pageNumber]?.status || "yeni");

    Promise.all([
      fetchQuranPage(pageNumber),
      fetchVerseAudioByPage(pageNumber).catch(() => []),
      fetchTranslationsByPage(pageNumber).catch(() => [])
    ]).then(([textData, audioData, transData]) => {
      setVerses(textData);
      versesRef.current = textData;
      setVerseAudios(audioData);
      
      const transMap: Record<string, string> = {};
      transData.forEach(tv => {
        if (tv.translations && tv.translations.length > 0) {
          transMap[tv.verse_key] = tv.translations[0].text;
        }
      });
      setTranslations(transMap);
      setLoading(false);
    }).catch(console.error);
    
    // Fetch word by word translations
    fetchWordTranslationsByPage(pageNumber).then(wbwData => {
      const transMap: Record<number, string> = {};
      wbwData.forEach((v: any) => {
        v.words.forEach((w: any) => {
          if (w.translation?.text) {
             // Kuran.com ID'leri lokal data ile birebir aynı olmayabilir ama 
             // api/v4 kelime pozisyonu / text mantığı ile genelde eşleşir.
             // Eğer ID'ler farklı ise eşleşme problem yaratır, ama quran.json'daki word id'leri api/v4'den alınmadır.
             transMap[w.id] = w.translation.text;
          }
        });
      });
      setWordTranslations(transMap);
    }).catch(console.error);
    
    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
             finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript.trim().length > 0) {
          const spokenWords = finalTranscript.trim().split(/\s+/);
          
          setRecognizedWords(prev => {
            const nextSet = new Set(prev);
            
            const allWords: QuranWord[] = [];
            versesRef.current.forEach(v => {
              v.words.forEach(w => {
                if (w.char_type_name === 'word') allWords.push(w);
              });
            });
            
            let firstUnrecognizedIndex = allWords.findIndex(w => !nextSet.has(w.id));
            
            if (firstUnrecognizedIndex !== -1) {
               for (const spoken of spokenWords) {
                 if (firstUnrecognizedIndex < allWords.length) {
                   const word = allWords[firstUnrecognizedIndex];
                   // Sadece ses gelince ilerlet (Gerçek senaryoda kelimeleri karşılaştır: spoken vs word.text_imlaei_simple)
                   nextSet.add(word.id);
                   firstUnrecognizedIndex++;
                 }
               }
            }
            return nextSet;
          });
        }
      };
      
      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  }, [pageNumber]);

  // Update playback rate dynamically if playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Generate Hifz Playlist
  const generatePlaylist = () => {
    if (verseAudios.length === 0) return [];
    const count = verseAudios.length;
    const list: number[] = [];
    if (!reverseMode) {
      for (let i = 0; i < count; i++) {
        for (let r = 0; r < repeatCount; r++) list.push(i);
        if (i > 0) {
          for (let r = 0; r < repeatCount; r++) {
            for (let j = 0; j <= i; j++) list.push(j);
          }
        }
      }
    } else {
      for (let i = count - 1; i >= 0; i--) {
        for (let r = 0; r < repeatCount; r++) list.push(i);
        if (i < count - 1) {
          for (let r = 0; r < repeatCount; r++) {
            for (let j = i; j < count; j++) list.push(j);
          }
        }
      }
    }
    return list;
  };

  const playIndex = async (indexInPlaylist: number, currentList: number[]) => {
    if (indexInPlaylist >= currentList.length) {
      setIsPlaying(false);
      setActiveVerseKey(null);
      return;
    }
    const vIndex = currentList[indexInPlaylist];
    const vAudio = verseAudios[vIndex];
    if (!vAudio || !vAudio.audio || !vAudio.audio.url) {
      setPlaylistIndex(indexInPlaylist + 1);
      playIndex(indexInPlaylist + 1, currentList);
      return;
    }

    setActiveVerseKey(vAudio.verse_key);
    const audioUrl = `https://audio.qurancdn.com/${vAudio.audio.url}`;
    const cachedUrl = await getCachedAudioUrl(audioUrl);

    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio(cachedUrl);
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.onended = () => {
      setPlaylistIndex(indexInPlaylist + 1);
      playIndex(indexInPlaylist + 1, currentList);
    };
    audioRef.current.play();
    setIsPlaying(true);
  };

  const toggleAudio = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (mode === 'dinle') {
        if (!audioRef.current || !audioRef.current.src.includes('everyayah')) {
          const paddedPage = pageNumber.toString().padStart(3, '0');
          const pageAudioUrl = `https://everyayah.com/data/Alafasy_128kbps/PageMp3s/Page${paddedPage}.mp3`;
          const cachedUrl = await getCachedAudioUrl(pageAudioUrl);
          audioRef.current = new Audio(cachedUrl);
          audioRef.current.playbackRate = playbackRate;
          audioRef.current.onended = () => setIsPlaying(false);
        }
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Ezber Modu
        if (playlist.length === 0) {
          const newList = generatePlaylist();
          setPlaylist(newList);
          setPlaylistIndex(0);
          playIndex(0, newList);
        } else {
          // Resume
          if (audioRef.current) {
             audioRef.current.play();
          } else {
             playIndex(playlistIndex, playlist);
          }
          setIsPlaying(true);
        }
      }
    }
  };

  const resetEzber = (autoplay = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setActiveVerseKey(null);
    
    // Use the latest repeatCount and reverseMode values (from state)
    // Actually generatePlaylist uses the state values correctly.
    const newList = generatePlaylist();
    setPlaylist(newList);
    setPlaylistIndex(0);
    
    if (autoplay && newList.length > 0) {
      playIndex(0, newList);
    }
  };

  const toggleListenAI = () => {
    if (!recognitionRef.current) {
      alert("Tarayıcınız ses tanımayı desteklemiyor (Chrome kullanın).");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMode('ai');
      setIsPlaying(false);
      audioRef.current?.pause();
      setRecognizedWords(new Set()); // Reset progress
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleUpdateStatus = (newStatus: PageStatus) => {
    const state = getHafizlikState();
    let pageData = state.pages[pageNumber];
    if (!pageData) {
      pageData = { status: newStatus, updatedAt: Date.now() };
    } else {
      pageData.status = newStatus;
      pageData.updatedAt = Date.now();
    }
    
    // Spaced Repetition Logic
    if (newStatus === 'has' || newStatus === 'tamam') {
      scheduleReviewForPage(pageData, true);
    } else if (newStatus === 'cig') {
      scheduleReviewForPage(pageData, false);
    }

    state.pages[pageNumber] = pageData;
    
    // Update studyHistory
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (!state.studyHistory) state.studyHistory = {};
    state.studyHistory[todayStr] = (state.studyHistory[todayStr] || 0) + 1;
    
    saveHafizlikState(state);
    setStatus(newStatus);
    alert(`Statü güncellendi: ${newStatus === 'has' ? 'Has (Tekrar Takvimine Eklendi)' : 'Çiğ (Yarın Tekrar Edilecek)'}`);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        Yükleniyor...
      </div>
    );
  }

  const lines: Record<number, (QuranWord & { verse_key: string })[]> = {};
  verses.forEach(verse => {
    verse.words.forEach(word => {
      if (!lines[word.line_number]) lines[word.line_number] = [];
      lines[word.line_number].push({ ...word, verse_key: verse.verse_key });
    });
  });

  return (
    <main className="container animate-fade-in-up" style={{ paddingBottom: '4rem' }}>
      <header className="glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Geri</button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Sayfa {pageNumber}</h2>
          <span style={{ padding: '0.25rem 0.75rem', background: status === 'has' || status === 'tamam' ? 'var(--primary)' : 'var(--accent)', color: 'white', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: 600 }}>
            {status?.toUpperCase()}
          </span>
        </div>
        
        {/* Kontrol Paneli */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => { setMode('dinle'); setIsListening(false); recognitionRef.current?.stop(); setIsPlaying(false); setActiveVerseKey(null); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: mode === 'dinle' ? 'var(--primary)' : 'transparent', color: mode === 'dinle' ? 'white' : 'var(--foreground)', cursor: 'pointer' }}>
              Dinle
            </button>
            <button onClick={() => { setMode('ezber'); setIsListening(false); recognitionRef.current?.stop(); resetEzber(false); }} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: mode === 'ezber' ? 'var(--primary)' : 'transparent', color: mode === 'ezber' ? 'white' : 'var(--foreground)', cursor: 'pointer' }}>
              Ezber Modu
            </button>
            <button onClick={toggleListenAI} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: mode === 'ai' ? '#8b5cf6' : 'transparent', color: mode === 'ai' ? 'white' : 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isListening ? <MicOff size={16} /> : <Mic size={16} />} 
              AI Dinle
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {mode === 'ezber' && (
              <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', padding: '0.5rem' }}>
                <Settings size={20} />
              </button>
            )}
            <button onClick={toggleAudio} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: isPlaying ? 'var(--accent)' : 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
           <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: testMode ? 'var(--accent)' : 'rgba(0,0,0,0.03)', color: testMode ? 'white' : 'var(--foreground)', padding: '0.5rem 1.5rem', borderRadius: '2rem', transition: 'all 0.3s', fontWeight: 500 }}>
             <input type="checkbox" checked={testMode} onChange={(e) => { setTestMode(e.target.checked); setRevealedWords(new Set()); }} style={{ display: 'none' }} />
             Test Modu (Gizle)
           </label>
           <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: wordByWordMode ? '#3b82f6' : 'rgba(0,0,0,0.03)', color: wordByWordMode ? 'white' : 'var(--foreground)', padding: '0.5rem 1.5rem', borderRadius: '2rem', transition: 'all 0.3s', fontWeight: 500 }}>
             <input type="checkbox" checked={wordByWordMode} onChange={(e) => setWordByWordMode(e.target.checked)} style={{ display: 'none' }} />
             Kelime Meali
           </label>
        </div>

        {showSettings && mode === 'ezber' && (
          <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Tekrar: 
              <input type="number" value={repeatCount} onChange={e => setRepeatCount(parseInt(e.target.value) || 1)} style={{ width: '50px', padding: '0.25rem' }} min={1} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Hız:
              <select value={playbackRate} onChange={e => setPlaybackRate(parseFloat(e.target.value))} style={{ padding: '0.25rem', borderRadius: '0.25rem' }}>
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2x</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={reverseMode} onChange={e => setReverseMode(e.target.checked)} />
              Tersten Hıfz
            </label>
            <button onClick={() => resetEzber(true)} style={{ padding: '0.25rem 0.75rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
              Yeniden Başlat
            </button>
          </div>
        )}
      </header>

      <div className="glass quran-text" style={{ padding: '2rem', borderRadius: '1rem', direction: 'rtl', fontSize: '2.2rem', textAlign: 'center', minHeight: '60vh' }}>
        {Object.entries(lines).map(([lineNum, words]) => (
          <div key={lineNum} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
            {words.map(word => {
              const isActive = mode === 'ezber' && activeVerseKey === word.verse_key;
              const isBlurred = (testMode && !revealedWords.has(word.id)) || (mode === 'ai' && !recognizedWords.has(word.id));
              
              let bgColor = 'transparent';
              if (isActive) bgColor = 'rgba(16, 185, 129, 0.2)';
              if (mode === 'ai' && recognizedWords.has(word.id)) bgColor = 'rgba(59, 130, 246, 0.2)';

              return (
                <div key={word.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 0.2rem' }}>
                  <span 
                    onClick={() => {
                      if (testMode || mode === 'ai') {
                        if (mode === 'ai') return; 
                        setRevealedWords(prev => {
                          const newSet = new Set(prev);
                          newSet.add(word.id);
                          return newSet;
                        });
                      } else {
                         setSelectedVerseTrans({ key: word.verse_key, text: translations[word.verse_key] || "Meal bulunamadı." });
                      }
                    }}
                    style={{ 
                    color: word.char_type_name === 'end' ? 'var(--accent)' : 'var(--foreground)',
                    background: bgColor,
                    padding: (isActive || mode === 'ai') ? '0 0.2rem' : '0',
                    borderRadius: '0.25rem',
                    filter: isBlurred ? 'blur(6px)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}>
                    {word.text_uthmani}
                  </span>
                  {wordByWordMode && word.char_type_name === 'word' && wordTranslations[word.id] && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', lineHeight: '1', marginTop: '0.25rem', fontFamily: 'sans-serif' }}>
                      {wordTranslations[word.id]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="animate-fade-in-up stagger-2" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={() => handleUpdateStatus('cig')} style={{ padding: '1rem 2rem', background: 'var(--accent)', color: 'white', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px var(--accent-glow)' }}>Hocaya Verdim (Çiğ)</button>
        <button onClick={() => handleUpdateStatus('has')} style={{ padding: '1rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '0.75rem', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px var(--primary-glow)' }}>Has Yap</button>
      </div>

      {selectedVerseTrans && (
        <div className="glass animate-fade-in-up" style={{ position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', borderRadius: '1rem', padding: '1.5rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ margin: 0, color: 'var(--primary)' }}>Ayet {selectedVerseTrans.key} Meali</h3>
             <button onClick={() => setSelectedVerseTrans(null)} style={{ background: 'var(--border)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', color: 'var(--foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
           </div>
           <p style={{ margin: 0, lineHeight: 1.6, fontSize: '1.1rem' }}>{selectedVerseTrans.text}</p>
        </div>
      )}
    </main>
  );
}
