"use client";
import { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '@/lib/auth';
import { createGroup, joinGroup, getUserGroups, getGroupMembers, GroupData } from '@/lib/groupApi';
import Link from 'next/link';
import { Users, PlusCircle, Search, Flame, Crown } from 'lucide-react';

export default function GroupsPage() {
  const { user, profile, loading } = useAuth();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  
  const [newGroupName, setNewGroupName] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");

  const refreshGroups = async () => {
    if (user) {
      const g = await getUserGroups(user.uid);
      setGroups(g);
      if (g.length > 0 && !activeGroup) {
        setActiveGroup(g[0]);
      }
    }
  };

  useEffect(() => {
    refreshGroups();
  }, [user]);

  useEffect(() => {
    if (activeGroup) {
      getGroupMembers(activeGroup.id).then(setMembers);
    }
  }, [activeGroup]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Yükleniyor...</div>;

  if (!user) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2>Giriş Yapın</h2>
        <p>Halkalara (Gruplara) katılmak için giriş yapmalısınız.</p>
        <Link href="/auth" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '0.5rem', textDecoration: 'none' }}>Giriş Yap</Link>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroup(newGroupName, user.uid);
      setNewGroupName("");
      alert("Halka başarıyla kuruldu!");
      refreshGroups();
    } catch (e: any) {
      alert("Hata: " + e.message);
    }
  };

  const handleJoin = async () => {
    if (!joinGroupId.trim()) return;
    try {
      await joinGroup(joinGroupId, user.uid);
      setJoinGroupId("");
      alert("Halkaya başarıyla katıldınız!");
      refreshGroups();
    } catch (e: any) {
      alert("Hata: " + e.message);
    }
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users /> Çalışma Halkaları</h1>
          <p style={{ color: 'gray' }}>Arkadaşlarınızla grup kurun, birbirinizi motive edin.</p>
        </div>
        <Link href="/" style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--foreground)' }}>Ana Sayfa</Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderTop: '4px solid var(--primary)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><PlusCircle size={20} /> Yeni Halka Kur</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Grup Adı" 
              value={newGroupName} 
              onChange={e => setNewGroupName(e.target.value)} 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <button onClick={handleCreate} style={{ padding: '0.75rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Kur</button>
          </div>
        </section>

        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', borderTop: '4px solid var(--accent)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Search size={20} /> Halkaya Katıl</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Grup ID Kodu" 
              value={joinGroupId} 
              onChange={e => setJoinGroupId(e.target.value)} 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
            />
            <button onClick={handleJoin} style={{ padding: '0.75rem 1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Katıl</button>
          </div>
        </section>
      </div>

      {groups.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {groups.map(g => (
            <button 
              key={g.id} 
              onClick={() => setActiveGroup(g)}
              style={{ padding: '0.75rem 1.5rem', background: activeGroup?.id === g.id ? 'var(--primary)' : 'var(--card-bg)', color: activeGroup?.id === g.id ? 'white' : 'var(--foreground)', border: 'none', borderRadius: '2rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {activeGroup && (
        <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>{activeGroup.name}</h2>
            <div style={{ fontSize: '0.8rem', color: 'gray', background: 'var(--background)', padding: '0.5rem', borderRadius: '0.5rem', userSelect: 'all' }}>
              ID: {activeGroup.id}
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {members.map(member => (
              <div key={member.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--background)', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {member.photoURL ? (
                    <img src={member.photoURL} alt={member.displayName} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 'bold' }}>{member.displayName}</span>
                      {member.uid === activeGroup.adminId && <Crown size={16} color="#f59e0b" />}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent)' }}><Flame size={18} /> {member.state?.currentStreak || 0}</span>
                    <span style={{ fontSize: '0.7rem', color: 'gray' }}>Seri</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
