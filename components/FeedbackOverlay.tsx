
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
  const isGroup = student.id === 'group';
  
  const particles = useMemo(() => {
    if (!isPos) return [];
    
    const count = 120;
    const layers = 4;
    
    return Array.from({ length: count }).map((_, i) => {
      const layer = i % layers;
      const angle = Math.random() * Math.PI * 2;
      
      const baseDistance = layer === 0 ? 100 : layer === 1 ? 200 : layer === 2 ? 300 : 400;
      const distance = baseDistance + Math.random() * 80;
      
      const colors = [
        '#FF3F3F', '#FFD700', '#00E5FF', '#FF00FF', '#7CFF01', '#FFFFFF', '#FFA500'
      ];

      return {
        id: i,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${(layer * 0.1) + (Math.random() * 0.05)}s`,
        duration: `${0.6 + Math.random() * 0.4}s`,
        size: layer === 0 ? '12px' : '8px'
      };
    });
  }, [isPos]);

  useEffect(() => {
    const timer = setTimeout(onComplete, 1600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md rounded-[3rem] p-6 md:p-8 shadow-2xl border-4 md:border-8 border-white overflow-visible transition-all transform animate-in zoom-in slide-in-from-bottom-8 duration-500 ${isPos ? 'bg-yellow-400' : 'bg-red-400'}`}>
        
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
          <div className="text-white mb-4">
            <h2 className="pokemon-font text-xl md:text-2xl mb-1 drop-shadow-lg tracking-tight">
              {isPos ? (isGroup ? 'AWESOME TEAM!' : 'CONGRATULATIONS!') : 'KEEP WORKING HARD!'}
            </h2>
            <h3 className="pokemon-font text-base md:text-lg drop-shadow-lg opacity-95">
              {isPos ? (isGroup ? '團隊真棒！' : '恭喜你！') : '繼續努力！'}
            </h3>
          </div>

          <div className="w-full space-y-2 mb-4">
             <div className="bg-white/30 backdrop-blur-md rounded-[1.5rem] py-3 px-6 border-2 border-white/50 shadow-inner">
                <p className="text-white text-2xl md:text-3xl font-black drop-shadow-md">
                   {isGroup ? student.name : `#${student.rollNo} ${student.name}`}
                </p>
             </div>
             
             {reason && (
               <div className="bg-black/20 backdrop-blur-sm px-6 py-2 rounded-xl border border-white/20">
                 <span className="text-white text-lg md:text-xl font-bold uppercase tracking-widest">
                    {reason}
                 </span>
               </div>
             )}
          </div>

          <div className={`relative mb-4 ${!isPos ? 'animate-shake' : 'animate-bounce'}`}>
            <div className={`absolute inset-0 blur-[40px] rounded-full scale-125 ${isPos ? 'bg-white/50' : 'bg-white/20'}`}></div>
            <img src={pokemonImg} className="w-40 h-40 md:w-52 h-52 relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] object-contain" alt="Status Visual" />
          </div>

          <div className="w-full">
            <div className="bg-black/30 backdrop-blur-md rounded-[2rem] p-4 md:p-6 border-4 border-white/40 shadow-2xl shine-effect">
              <div className="text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Points / 分數</div>
              <div className={`text-4xl md:text-6xl font-black ${isPos ? 'text-yellow-200' : 'text-red-100'} drop-shadow-lg`}>
                 {student.points > 0 ? `+${student.points}` : student.points}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
