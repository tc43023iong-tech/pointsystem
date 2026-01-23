
import React, { useEffect, useMemo } from 'react';
import { Student } from '../types';

interface FeedbackOverlayProps {
  student: Student;
  type: 'positive' | 'negative';
  reason?: string;
  delta: number;
  onComplete: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ student, type, reason, delta, onComplete }) => {
  const isPos = type === 'positive';
  const isGroup = student.id === 'group';
  
  const particles = useMemo(() => {
    if (!isPos) return [];
    const count = 80;
    return Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 300;
      const colors = ['#F06292', '#FFD54F', '#4FC3F7', '#81C784', '#BA68C8'];
      return {
        id: i,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${Math.random() * 0.2}s`,
        duration: `${0.8 + Math.random() * 0.6}s`,
        size: `${Math.random() * 8 + 4}px`
      };
    });
  }, [isPos]);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
      {/* Pink Bordered Card - Balanced Proportions */}
      <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-7 border-[10px] border-[#F06292] shadow-2xl relative animate-in zoom-in duration-500 flex flex-col items-center">
        
        {/* Firework Particles for Success */}
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

        {/* Top Status Text - Larger and Impactful */}
        <div className="flex flex-col items-center gap-1 mb-5">
           <span className="text-5xl mb-1">{isPos ? '✨' : '⚠️'}</span>
           <div className={`flex flex-col items-center leading-none text-center ${isPos ? 'text-[#F06292]' : 'text-[#78909C]'}`}>
             <span className="font-black text-sm tracking-[0.3em] uppercase opacity-50 mb-1">
               {isPos ? 'FANTASTIC WORK' : 'NEVER GIVE UP'}
             </span>
             <span className="font-black text-4xl md:text-5xl tracking-tighter">
               {isPos ? '恭喜你' : '繼續努力！'}
             </span>
           </div>
        </div>

        {/* Avatar Section - Slightly Larger */}
        <div className="w-full flex items-center justify-center mb-6 relative">
           <img 
              src={pokemonImg} 
              className={`w-48 h-48 object-contain drop-shadow-2xl z-10 relative ${isPos ? 'animate-bounce' : 'animate-shake'}`}
              alt="Pokemon"
           />
           {/* Ambient Glow behind Pokemon */}
           <div className={`absolute inset-0 opacity-25 blur-3xl scale-125 -z-0 ${isPos ? 'bg-pink-400' : 'bg-gray-400'}`}></div>
        </div>

        {/* Student Name and Score Change - Bold Center */}
        <div className="text-center w-full space-y-2 mb-6">
          <h3 className="text-[#D81B60] text-3xl font-black tracking-tighter leading-tight drop-shadow-sm">
             {isGroup ? student.name : `#${student.rollNo} ${student.name}`}
          </h3>
          
          <div className="flex flex-col items-center justify-center gap-3 mt-4">
             <div className={`px-8 py-2 rounded-2xl font-black text-4xl shadow-md border-4 border-white ${isPos ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {delta > 0 ? `+${delta}` : delta}
             </div>
             {reason && (
               <div className="bg-pink-50/50 px-6 py-2 rounded-xl border border-pink-100/50 mt-1">
                 <span className="text-pink-500 text-xl font-black tracking-tight block">
                    {reason}
                 </span>
               </div>
             )}
          </div>
        </div>

        {/* Current Points Bar - Refined Footer */}
        <div className="w-full bg-[#FDF2F5] rounded-[2rem] p-3 px-6 border-2 border-white shadow-inner flex justify-between items-center">
          <div className="flex flex-col items-start leading-none">
            <span className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">TOTAL POINTS</span>
            <span className="text-xs font-black text-pink-400">目前總分</span>
          </div>
          <div className="text-4xl font-black text-[#D81B60] tracking-tighter">
            {student.points}
          </div>
        </div>
      </div>
    </div>
  );
};
