
import React, { useEffect, useMemo } from 'react';
import { Student } from '../types';

interface FeedbackOverlayProps {
  student: Student;
  type: 'positive' | 'negative';
  reason?: string;
  onComplete: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ student, type, reason, onComplete }) => {
  const isPos = type === 'positive';
  
  // Generate multi-layered particles for a "blooming" firework effect
  const particles = useMemo(() => {
    if (!isPos) return [];
    
    const count = 120; // Denser particles
    const layers = 3;  // Three distinct "waves" of the bloom
    
    return Array.from({ length: count }).map((_, i) => {
      const layer = i % layers;
      const angle = Math.random() * Math.PI * 2;
      
      // Different distances for blooming effect
      const baseDistance = layer === 0 ? 120 : layer === 1 ? 240 : 360;
      const distance = baseDistance + Math.random() * 80;
      
      const colors = [
        '#FF3F3F', // Red
        '#FFD700', // Gold
        '#00E5FF', // Cyan
        '#FF00FF', // Magenta
        '#7CFF01', // Lime
        '#FFFFFF'  // White spark
      ];

      return {
        id: i,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${(layer * 0.15) + (Math.random() * 0.1)}s`, // Staggered layers
        duration: `${0.6 + Math.random() * 0.4}s`,
        size: layer === 0 ? '12px' : '8px'
      };
    });
  }, [isPos]);

  useEffect(() => {
    const timer = setTimeout(onComplete, 1250);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-lg rounded-[3rem] p-8 md:p-10 shadow-2xl border-8 border-white overflow-visible transition-all transform animate-in zoom-in slide-in-from-bottom-10 duration-500 ${isPos ? 'bg-yellow-400' : 'bg-red-400'}`}>
        
        {/* Firework Particles Container */}
        {isPos && (
          <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
            {particles.map(p => (
              <div 
                key={p.id} 
                className="firework-particle" 
                style={{ 
                  '--dx': p.dx, 
                  '--dy': p.dy, 
                  '--duration': p.duration,
                  color: p.color,
                  backgroundColor: 'currentColor',
                  animationDelay: p.delay,
                  width: p.size,
                  height: p.size
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="text-white mb-6">
            <h2 className="pokemon-font text-xl md:text-2xl mb-1 drop-shadow-lg tracking-tight">
              {isPos ? 'CONGRATULATIONS!' : 'KEEP WORKING HARD!'}
            </h2>
            <h3 className="pokemon-font text-lg md:text-xl drop-shadow-lg opacity-90">
              {isPos ? '恭喜你！' : '繼續努力！'}
            </h3>
          </div>

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

          <div className={`relative mb-8 ${!isPos ? 'animate-shake' : 'animate-bounce'}`}>
            <div className={`absolute inset-0 blur-3xl rounded-full scale-150 ${isPos ? 'bg-white/40' : 'bg-white/20'}`}></div>
            <img src={pokemonImg} className="w-40 h-40 md:w-56 md:h-56 relative z-10 drop-shadow-2xl object-contain" alt="Student Pokemon" />
          </div>

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
