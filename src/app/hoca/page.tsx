"use client";
import { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '@/lib/auth';
import { getStudentsForTeacher } from '@/lib/teacherApi';
import Link from 'next/link';
import { Users, Copy, CheckCircle, BarChart2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function HocaPage() {
  const { user, profile, loading } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile?.role === 'teacher' && user) {
      getStudentsForTeacher(user.uid).then(setStudents);
    }
  }, [profile, user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</div>;

  if (!user || profile?.role !== 'teacher') {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Yetkisiz Erişim</h2>
        <p>Bu sayfayı sadece hocalar görüntüleyebilir.</p>
        <Link href="/" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>Ana Sayfaya Dön</Link>
      </div>
    );
  }

  const classCode = user.uid;

  const handleCopy = () => {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Hoca Paneli</h1>
        <p style={{ color: 'gray' }}>Talebelerinizi bu ekrandan takip edebilirsiniz.</p>
      </header>

      <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: '4px solid var(--accent)' }}>
        <h3>Sınıf Kodunuz</h3>
        <p style={{ color: 'gray', fontSize: '0.9rem', marginBottom: '1rem' }}>Öğrencilerinizin size bağlanması için bu kodu onlarla paylaşın.</p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <code style={{ background: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold', flex: 1 }}>
            {classCode}
          </code>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
      </section>

      {students.length > 0 && (
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><BarChart2 size={24} /> Sınıf Genel Durumu</h2>
          <div style={{ height: '250px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Ortalama Has', value: Math.round(students.reduce((acc, s) => {
                  let count = 0;
                  if (s.state?.pages) {
                    Object.values(s.state.pages).forEach(p => { if (p.status === 'has') count++; });
                  }
                  return acc + count;
                }, 0) / (students.length || 1)) },
                { name: 'Ortalama Çiğ', value: Math.round(students.reduce((acc, s) => {
                  let count = 0;
                  if (s.state?.pages) {
                    Object.values(s.state.pages).forEach(p => { if (p.status === 'cig') count++; });
                  }
                  return acc + count;
                }, 0) / (students.length || 1)) }
              ]}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '0.5rem' }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Users size={24} /> Talebelerim ({students.length})</h2>
        {students.length === 0 ? (
          <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem', color: 'gray' }}>
            Henüz size bağlı bir öğrenci bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {students.map(student => {
              const state = student.state;
              let hasCount = 0;
              let cigCount = 0;
              let delayedReviews = 0;
              
              if (state && state.pages) {
                const now = Date.now();
                Object.values(state.pages).forEach(p => {
                  if (p.status === 'has') hasCount++;
                  if (p.status === 'cig') cigCount++;
                  if ((p.status === 'has' || p.status === 'tamam') && p.nextReviewAt && p.nextReviewAt < now) {
                    delayedReviews++;
                  }
                });
              }

              return (
                <div key={student.uid} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {student.photoURL ? (
                        <img src={student.photoURL} alt={student.displayName} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                          {student.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 style={{ margin: 0 }}>{student.displayName}</h3>
                        <p style={{ margin: 0, color: 'gray', fontSize: '0.9rem' }}>{student.email}</p>
                      </div>
                    </div>
                    {delayedReviews > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>
                        <AlertTriangle size={18} /> {delayedReviews} Geciken Tekrar
                      </div>
                    )}
                  </div>
                  
                  {state && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{hasCount}</div>
                         <div style={{ fontSize: '0.8rem', color: 'gray' }}>Has Sayfa</div>
                      </div>
                      <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{cigCount}</div>
                         <div style={{ fontSize: '0.8rem', color: 'gray' }}>Çiğ Sayfa</div>
                      </div>
                      <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{state.currentStreak || 0}</div>
                         <div style={{ fontSize: '0.8rem', color: 'gray' }}>Günlük Seri</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
