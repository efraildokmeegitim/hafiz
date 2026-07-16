"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card)', padding: '0.5rem 1rem', borderRadius: '0.5rem', boxShadow: 'var(--shadow-sm)' }}>
      <Palette size={20} color="var(--primary)" />
      <select 
        value={theme} 
        onChange={e => setTheme(e.target.value)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--foreground)', 
          outline: 'none',
          fontFamily: 'inherit',
          cursor: 'pointer'
        }}
      >
        <option value="system">Sistem</option>
        <option value="light">Açık (Zümrüt)</option>
        <option value="dark">Koyu (Gece)</option>
        <option value="ocean">Okyanus (Mavi)</option>
        <option value="desert">Çöl (Kum)</option>
      </select>
    </div>
  );
}
