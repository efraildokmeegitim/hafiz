import Dashboard from '@/components/Dashboard';
import AuthProfile from '@/components/AuthProfile';

export default function Home() {
  return (
    <main className="container">
      <header style={{ padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Hafız Yol Arkadaşım</h1>
          <p style={{ color: 'var(--accent)' }}>Diyanet Usulü Hafızlık Takip Sistemi</p>
        </div>
        <AuthProfile />
      </header>

      <div style={{ marginTop: '2rem' }}>
        <Dashboard />
      </div>
    </main>
  );
}
