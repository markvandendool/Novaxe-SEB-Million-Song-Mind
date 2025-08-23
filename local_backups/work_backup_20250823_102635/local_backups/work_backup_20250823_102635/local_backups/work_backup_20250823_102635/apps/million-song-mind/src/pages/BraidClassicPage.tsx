import React, { useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import BraidClassic from '@/components/braid/BraidClassic';
import { fetchAndValidateTonalities } from '@/utils/braid/validateTonalities';

const BraidClassicPage: React.FC = () => {
  useSEO({
    title: 'Classic Braid — MillionSongMind',
    description: 'Exact classic Novaxe braid (nvx_braid_fixes2) scaffold with tonalities.',
    canonicalPath: '/braid-classic',
  });

  useEffect(() => {
    fetchAndValidateTonalities();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl  font-bold">Classic Braid</h1>
      </header>
      <BraidClassic />
    </main>
  );
};

export default BraidClassicPage;
