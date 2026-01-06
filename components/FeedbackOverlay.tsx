
import React, { useEffect, useMemo } from 'react';
import { Student } from '../types';

interface FeedbackOverlayProps {
  student: Student;
  type: 'positive' | 'negative';
  reason?: string;
  onComplete: () => void;
}

interface Particle {
  id: number;
  dx: string;
  dy: string;
  color: string;
  delay: string;
  size: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ student, type, reason, onComplete }) => {
  const isPos = type === 'positive';
  
  // Generate particles with random directions and properties
  const particles = useMemo(() => {
    if (!isPos) return [];
    return Array.from({ length: 60 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 150 + Math.random() * 300; // Pixels to travel
      return {
        id: i,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance}px`,
        color: ['#ffeb3b', '#ff5722', '#4caf50', '#2196f3', '#e91e63', '#ffffff', '#00bcd4'][Math.floor(Math.random() * 7)],
        delay: `${Math.random() * 0.1}s`,
        size: `${Math.random() * 8 + 4}px`
      };
    });
  }, [isPos]);

  useEffect(() => {
    // Set duration to 1.25 seconds as requested
    const timer = setTimeout(onComplete, 1250);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-lg rounded-[3rem] p-8 md:p-10 shadow-2xl border-8 border-white overflow-visible transition-all transform animate-in zoom-in slide-in-from-bottom-10 duration-500 ${isPos ? 'bg-yellow-400' : 'bg-red-400'}`}>
        
        {/* Firework Particles Container (Centered) */}
        {isPos && (
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            {particles.map(p => (
              <div 
                key={p.id} 
                className="firework-particle" 
                style={{ 
                  '--dx': p.dx, 
                  '--dy': p.dy, 
                  backgroundColor: p.color,
                  animationDelay: p.delay,
                  animationDuration: '0.8s', // Faster fireworks to fit 1.25s
                  width: p.size,
                  height: p.size
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Header Title */}
          <div className="text-white mb-6">
            <h2 className="pokemon-font text-xl md:text-2xl mb-1 drop-shadow-lg tracking-tight">
              {isPos ? 'CONGRATULATIONS!' : 'KEEP WORKING HARD!'}
            </h2>
            <h3 className="pokemon-font text-lg md:text-xl drop-shadow-lg opacity-90">
              {isPos ? '恭喜你！' : '繼續努力！'}
            </h3>
          </div>

          {/* Student Name & Reason (Above Pokemon) */}
          <div className="w-full space-y-3 mb-8">
             <div className="bg-white/30 backdrop-blur-md rounded-2xl py-3 px-6 border-2 border-white/50 shadow-inner">
                <p className="text-white text-2xl md:text-3xl font-black drop-shadow-md">
                   #{student.rollNo} {student.name}
                </p>
             </div>
             
             {reason && (
               <div className="bg-black/20 backdrop-blur-sm px-6 py-2 rounded-xl border border-white/20 animate-pulse">
                 <span className="text-white text-lg md:text-xl font-bold uppercase tracking-wide">
                    {reason}
                 </span>
               </div>
             )}
          </div>

          {/* Pokemon Image Block */}
          <div className={`relative mb-8 ${!isPos ? 'animate-shake' : 'animate-bounce'}`}>
            <div className={`absolute inset-0 blur-3xl rounded-full scale-150 ${isPos ? 'bg-white/40' : 'bg-white/20'}`}></div>
            <img src={pokemonImg} className="w-40 h-40 md:w-56 md:h-56 relative z-10 drop-shadow-2xl object-contain" alt="Student Pokemon" />
          </div>

          {/* Total Score Footer */}
          <div className="w-full">
            <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-4 md:p-6 border-4 border-white/30 shine-effect">
              <div className="text-white text-xs md:text-sm font-bold uppercase tracking-widest opacity-80 mb-1">Current Total / 目前總分</div>
              <div className={`text-4xl md:text-6xl font-black ${isPos ? 'text-yellow-200' : 'text-red-100'} drop-shadow-md`}>
                 {student.points}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
