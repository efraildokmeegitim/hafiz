"use client";
import { useState, useEffect } from 'react';
import { checkCacheSize, clearAudioCache, downloadAudioFile } from '@/lib/audioManager';
import { fetchVerseAudioByPage } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Download, Trash2, ArrowLeft } from 'lucide-react';

export default function AyarlarPage() {
  const [cachedCount, setCachedCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkCacheSize().then(setCachedCount);
  }, []);

  const handleDownloadAll = async () => {
    const confirmation = confirm("Tüm Kuran ses dosyalarını indirmek cihazınızda büyük yer kaplayacaktır (~1 GB). Devam etmek istiyor musunuz?");
    if (!confirmation) return;

    setIsDownloading(true);
    setProgress(0);
    const totalPages = 604;
    
    try {
      for (let i = 1; i <= totalPages; i++) {
        // Just downloading the full page single mp3s for now, to save requests
        const paddedPage = i.toString().padStart(3, '0');
        const pageAudioUrl = `https://everyayah.com/data/Alafasy_128kbps/PageMp3s/Page${paddedPage}.mp3`;
        await downloadAudioFile(pageAudioUrl);
        setProgress(Math.round((i / totalPages) * 100));
      }
      alert("İndirme tamamlandı!");
    } catch (e) {
      alert("İndirme sırasında bir hata oluştu.");
    } finally {
      setIsDownloading(false);
      checkCacheSize().then(setCachedCount);
    }
  };

  const handleClearCache = async () => {
    if (confirm("İndirilen tüm ses dosyalarını silmek istediğinize emin misiniz?")) {
      await clearAudioCache();
      setCachedCount(0);
      alert("Ses önbelleği temizlendi.");
    }
  };

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2>Ayarlar</h2>
      </header>

      <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3>Çevrimdışı Ses İndirme (Offline Mode)</h3>
          <p style={{ color: 'gray', marginTop: '0.5rem' }}>
            İnternet bağlantınız olmadan da dinleme ve ezberleme yapabilmek için ses dosyalarını cihazınıza indirebilirsiniz. 
            (Sadece Sayfa ve Ezber Modu için gerekli dosyaları içerir.)
          </p>
          <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
            İndirilen Dosya Sayısı: {cachedCount}
          </p>
        </div>

        {isDownloading ? (
          <div>
            <p>İndiriliyor: %{progress}</p>
            <div style={{ width: '100%', background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{ width: `${progress}%`, background: 'var(--primary)', height: '100%', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={handleDownloadAll} style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Download size={18} /> Tüm Sesleri İndir
            </button>
            <button onClick={handleClearCache} style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', color: 'white', borderRadius: '0.5rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <Trash2 size={18} /> Ön Belleği Temizle
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
