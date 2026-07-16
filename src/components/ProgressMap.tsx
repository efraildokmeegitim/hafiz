"use client";
import { useEffect, useState } from 'react';
import { getHafizlikState, HafizlikState, PageData } from '@/lib/storage';
import Link from 'next/link';

export default function ProgressMap() {
  const [state, setState] = useState<HafizlikState | null>(null);

  useEffect(() => {
    setState(getHafizlikState());
  }, []);

  if (!state) return null;

  const getStatusColor = (pageData: PageData | undefined) => {
    switch (pageData?.status) {
      case 'tamam': return 'var(--primary)';
      case 'has': return 'var(--primary)';
      case 'cig': return 'var(--accent)';
      default: return 'var(--border)';
    }
  };

  const pages = Array.from({ length: 604 }, (_, i) => i + 1);

  return (
    <section className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', marginTop: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Kur'an-ı Kerim Haritası (604 Sayfa)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(24px, 1fr))', gap: '4px' }}>
        {pages.map(page => (
          <Link key={page} href={`/mushaf/${page}`} title={`Sayfa ${page} ${state.pages[page] ? `(${state.pages[page].status})` : ''}`} style={{
            width: '100%',
            aspectRatio: '1/1',
            backgroundColor: getStatusColor(state.pages[page]),
            borderRadius: '3px',
            display: 'block',
            transition: 'transform 0.2s',
            opacity: state.pages[page] ? 1 : 0.4
          }} />
        ))}
      </div>
    </section>
  );
}
