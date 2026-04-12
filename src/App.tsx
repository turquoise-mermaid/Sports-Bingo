import { useState } from 'react';
import { SportSelection } from './components/SportSelection';
import { BingoBoard } from './components/BingoBoard';

export type Sport = 'soccer' | 'americanFootball' | 'baseball' | 'basketball' | 'tennis' | 'hockey';

export default function App() {
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
  };

  const handleBackToSports = () => {
    setSelectedSport(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px),
                         repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px)`
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-neutral-950/80 to-stone-950/50"></div>
      
      <div className="relative z-10">
        {!selectedSport ? (
          <SportSelection onSelectSport={handleSportSelect} />
        ) : (
          <BingoBoard sport={selectedSport} onBackToSports={handleBackToSports} />
        )}
      </div>
    </div>
  );
}
