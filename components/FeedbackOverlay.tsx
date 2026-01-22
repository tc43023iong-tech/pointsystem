
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
    const timer = setTimeout(onComplete, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      {/* Pink Bordered Card - High-end Aesthetic */}
      <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 border-[10px] border-[#F06292] shadow-2xl relative animate-in zoom-in duration-500 flex flex-col items-center">
        
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

        {/* Top Status Text - Accurate to User Images but split into two lines */}
        <div className="flex items-center gap-4 mb-6">
           <span className="text-4xl shrink-0">{isPos ? '✨' : '⚠️'}</span>
           <div className={`flex flex-col items-start leading-none ${isPos ? 'text-[#F06292]' : 'text-[#78909C]'}`}>
             <span className="font-black text-2xl tracking-tighter uppercase mb-1">
               {isPos ? 'CONGRATULATIONS!' : 'KEEP TRYING!'}
             </span>
             <span className="font-black text-xl tracking-tight">
               {isPos ? '恭喜你' : '繼續努力！'}
             </span>
           </div>
        </div>

        {/* Avatar Box */}
        <div className={`w-full aspect-square rounded-[3rem] flex items-center justify-center mb-6 relative overflow-hidden ${isPos ? 'bg-[#FDF2F5]' : 'bg-[#F1F4F9]'}`}>
           <img 
              src={pokemonImg} 
              className={`w-40 h-40 object-contain drop-shadow-2xl z-10 ${isPos ? 'animate-bounce' : 'animate-shake'}`}
              alt="Pokemon"
           />
           <div className={`absolute inset-0 opacity-20 blur-2xl ${isPos ? 'bg-pink-300' : 'bg-gray-400'}`}></div>
        </div>

        {/* Student Name and Score Change */}
        <div className="text-center w-full space-y-1 mb-6">
          <h3 className="text-[#D81B60] text-3xl font-black tracking-tighter leading-tight">
             {isGroup ? student.name : `#${student.rollNo} ${student.name}`}
          </h3>
          
          <div className="flex items-center justify-center gap-3 mt-4">
             <div className={`px-5 py-2 rounded-2xl font-black text-2xl shadow-sm border-2 border-white ${isPos ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {delta > 0 ? `+${delta}` : delta}
             </div>
             {reason && (
               <div className="bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100 shadow-inner">
                 <span className="text-slate-500 text-sm font-black uppercase tracking-widest">
                    {reason}
                 </span>
               </div>
             )}
          </div>
        </div>

        {/* Current Points Bar */}
        <div className="w-full bg-[#FDF2F5] rounded-[2.2rem] p-4 border-2 border-white shadow-inner text-center">
          <p className="text-[10px] font-black text-pink-300 uppercase tracking-[0.4em] mb-1">CURRENT TOTAL / 目前分數</p>
          <div className="text-5xl font-black text-[#D81B60] tracking-tighter">
            {student.points}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-[10px] font-black text-pink-200 uppercase tracking-[0.5em]">
          Feedback System
        </div>
      </div>
    </div>
  );
};
