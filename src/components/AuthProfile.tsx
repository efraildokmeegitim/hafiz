"use client";
import { useAuth, loginWithGoogle, logout } from "@/lib/auth";
import { LogIn, LogOut, User as UserIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AuthProfile() {
  const { user, profile, loading } = useAuth();

  if (loading) return <div style={{ height: '40px' }}>...</div>;

  if (!user) {
    return (
      <button 
        onClick={loginWithGoogle}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem', borderRadius: '2rem',
          background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer'
        }}
      >
        <LogIn size={18} />
        Google ile Giriş Yap
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border)' }}>
      {user.photoURL ? (
        <img src={user.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
      ) : (
        <UserIcon size={32} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.displayName}</span>
        <span style={{ fontSize: '0.75rem', color: 'gray' }}>
          {profile?.role === 'teacher' ? 'Hoca' : 'Öğrenci'}
        </span>
      </div>
      
      {profile?.role === 'teacher' && (
        <Link href="/hoca" style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
          <ShieldCheck size={16} /> Paneli Aç
        </Link>
      )}

      <button 
        onClick={logout}
        style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: '0.5rem' }}
        title="Çıkış Yap"
      >
        <LogOut size={18} />
      </button>
    </div>
  );
}
