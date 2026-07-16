"use client";
import { useEffect, useState } from 'react';
import { getHafizlikState, HafizlikState, syncStateFromCloud } from '@/lib/storage';
import { useAuth } from '@/lib/auth';
import { joinClass } from '@/lib/teacherApi';
import Link from 'next/link';
import ProgressMap from './ProgressMap';
import ThemeSwitcher from './ThemeSwitcher';
import { Flame, Share2, BookOpen, Clock, Settings, UserPlus, Award, Calendar, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [state, setState] = useState<HafizlikState | null>(null);
  const { user, profile } = useAuth();
  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    setState(getHafizlikState());
  }, []);

  useEffect(() => {
    if (user) {
      syncStateFromCloud().then((cloudState) => {
        if (cloudState) {
          setState(cloudState);
        }
      });
    }
  }, [user]);

  if (!state) return <p>Yükleniyor...</p>;

  // Algoritma
  const nextLessonPage = 20; // Osmanli usulu örnek
  const now = Date.now();

  const cigPages = Object.entries(state.pages)
    .filter(([_, data]) => data.status === "cig")
    .map(([page]) => parseInt(page));

  const hasPages = Object.entries(state.pages)
    .filter(([_, data]) => data.status === "has")
    .map(([page]) => parseInt(page));
    
  const todayReviews = Object.entries(state.pages)
    .filter(([_, data]) => {
      if (data.status !== "has" && data.status !== "tamam") return false;
      if (!data.nextReviewAt) return false;
      return data.nextReviewAt <= now;
    })
    .map(([page]) => parseInt(page));

  const delayedPages = Object.entries(state.pages)
    .filter(([_, data]) => data.status === "has" && (now - data.updatedAt) > 5 * 24 * 60 * 60 * 1000)
    .map(([page]) => parseInt(page));

  // WhatsApp Rapor
  const handleShare = () => {
    const text = `Hocam Selamun Aleyküm, \nBugün durumum:\n🔥 Seri: ${state.currentStreak} Gün\n📖 Çiğ Tekrar: ${cigPages.length} Sayfa\n✅ Has Tekrar: ${hasPages.length} Sayfa\nSaygılarımla.`;
    window.open(`whatsapp://send?text=${encodeURIComponent(text)}`);
  };

  // İstatistik verisi
  const total = 604;
  const completed = hasPages.length + cigPages.length;
  const remaining = total - completed;
  const chartData = [
    { name: 'Ezberlenen', value: completed, color: '#10b981' },
    { name: 'Kalan', value: remaining, color: '#30363d' }
  ];

  const BADGE_INFO: Record<string, { title: string, color: string, icon: string }> = {
    first_page: { title: 'İlk Adım', color: '#3b82f6', icon: '🌟' },
    first_juz: { title: 'İlk Cüz', color: '#8b5cf6', icon: '👑' },
    streak_3: { title: '3 Günlük Seri', color: '#f59e0b', icon: '🔥' },
    streak_7: { title: '1 Haftalık Seri', color: '#ef4444', icon: '🚀' },
    streak_30: { title: '1 Aylık Seri', color: '#10b981', icon: '💎' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div className="animate-fade-in-up stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hafızlık Paneli</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <ThemeSwitcher />
          <Link href="/gruplar" style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card)', padding: '0.5rem 1rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s' }}>
            <Users size={20} /> Halkalar
          </Link>
          <Link href="/ayarlar" style={{ color: 'var(--foreground)', display: 'flex', alignItems: 'center', background: 'var(--card)', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <Settings size={24} />
          </Link>
        </div>
      </div>

      {user && profile?.role === 'student' && !profile.teacherId && (
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={20}/> Hocaya Bağlan</h3>
          <p style={{ fontSize: '0.9rem', color: 'gray' }}>Hocanızın size verdiği sınıf kodunu girerek hesabınızı hocanıza bağlayın. Böylece gelişiminizi takip edebilir.</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Sınıf Kodu (Hoca ID)" 
              value={classCode} 
              onChange={e => setClassCode(e.target.value)} 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <button 
              onClick={async () => {
                if (!classCode) return;
                setJoining(true);
                try {
                  await joinClass(user.uid, classCode);
                  alert("Hocaya başarıyla bağlandınız! Sayfayı yenileyin.");
                } catch (e: any) {
                  alert(e.message || "Bağlantı hatası.");
                }
                setJoining(false);
              }}
              disabled={joining}
              style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {joining ? "Bağlanıyor..." : "Bağlan"}
            </button>
          </div>
        </section>
      )}

      {/* Motivasyon ve Streak */}
      <div className="animate-fade-in-up stagger-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--accent)' }}>
          <Flame size={32} color="var(--accent)" />
          <div>
            <h4 style={{ fontSize: '0.875rem', color: 'gray' }}>Çalışma Serisi</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{state.currentStreak} Gün</div>
          </div>
        </section>
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', borderTop: '4px solid var(--primary)' }}>
           <div>
            <h4 style={{ fontSize: '0.875rem', color: 'gray' }}>Ezberlenen</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{completed} / 604</div>
          </div>
          <div style={{ width: '60px', height: '60px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={20} outerRadius={30} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Activity Heatmap (Son 60 Gün) */}
      <section className="glass animate-fade-in-up stagger-3" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Calendar size={20}/> Çalışma Takvimi</h3>
        <p style={{ fontSize: '0.9rem', color: 'gray', marginBottom: '1rem' }}>Son 60 gündeki hafızlık aktiviteniz.</p>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {Array.from({ length: 60 }).map((_, i) => {
             const d = new Date();
             d.setDate(d.getDate() - (59 - i));
             const dateStr = d.toISOString().split('T')[0];
             const count = state.studyHistory?.[dateStr] || 0;
             let bgColor = 'rgba(255, 255, 255, 0.05)';
             if (count > 0) bgColor = 'rgba(16, 185, 129, 0.3)';
             if (count > 2) bgColor = 'rgba(16, 185, 129, 0.6)';
             if (count > 5) bgColor = '#10b981';
             
             return (
               <div 
                 key={dateStr} 
                 title={`${dateStr}: ${count} Sayfa`}
                 style={{ 
                   width: '14px', 
                   height: '14px', 
                   borderRadius: '3px', 
                   background: bgColor,
                   border: count > 0 ? 'none' : '1px solid var(--border)'
                 }} 
               />
             );
          })}
        </div>
      </section>

      {(state.badges && state.badges.length > 0) && (
        <section className="glass animate-fade-in-up stagger-4" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Award size={20}/> Rozetlerin</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {state.badges.map(bId => {
              const info = BADGE_INFO[bId];
              if (!info) return null;
              return (
                <div key={bId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--card-bg)', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: `1px solid ${info.color}` }}>
                  <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.25rem', color: info.color }}>{info.title}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="glass animate-fade-in-up stagger-5" style={{ padding: '1.5rem', borderRadius: '1rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BookOpen size={20}/> Yeni Ders</h3>
          <button onClick={handleShare} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}><Share2 size={16}/> Hocaya Bildir</button>
        </div>
        <p style={{ marginBottom: '1rem' }}>Sıradaki ezberlemeniz gereken sayfa.</p>
        <Link href={`/mushaf/${nextLessonPage}`} style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '0.5rem', fontWeight: 'bold' }}>
          Sayfa {nextLessonPage} - Başla
        </Link>
      </section>

      {todayReviews.length > 0 && (
        <section className="glass animate-fade-in-up stagger-5" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20}/> Bugünkü Tekrar Görevlerin</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'gray' }}>Aralıklı tekrar algoritmasına göre bugün bu sayfaları tekrar edip hocaya vermeniz gerekiyor.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {todayReviews.map(p => (
              <Link key={p} href={`/mushaf/${p}`} style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem', color: '#3b82f6' }}>
                Sayfa {p}
              </Link>
            ))}
          </div>
        </section>
      )}

      {delayedPages.length > 0 && (
        <section className="glass animate-fade-in-up stagger-5" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20}/> Geciken Tekrarlar</h3>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'gray' }}>Bu sayfaları en son 5 günden daha uzun süre önce tekrar ettiniz. Lütfen unutmamak için gözden geçirin.</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {delayedPages.map(p => (
              <Link key={p} href={`/mushaf/${p}`} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', color: '#ef4444' }}>
                Sayfa {p}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="glass animate-fade-in-up stagger-5" style={{ padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--accent)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Çiğ Tekrarlar</h3>
        {cigPages.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {cigPages.map(p => (
              <Link key={p} href={`/mushaf/${p}`} style={{ padding: '0.5rem 1rem', background: 'rgba(217, 119, 6, 0.2)', borderRadius: '0.5rem', color: 'var(--accent)' }}>
                Sayfa {p}
              </Link>
            ))}
          </div>
        ) : (
          <p>Şu an çiğ tekrarınız bulunmuyor.</p>
        )}
      </section>
      
      <ProgressMap />
    </div>
  );
}
