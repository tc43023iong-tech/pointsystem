
import React, { useState } from 'react';
import { POKEMON_COUNT } from '../constants';
import { Student } from '../types';

interface PokemonSelectorProps {
  onSelect: (id: number) => void;
  onClose: () => void;
  currentId: number;
  student: Student;
}

export const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onSelect, onClose, currentId, student }) => {
  const [search, setSearch] = useState('');
  
  const pokemonIds = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1);
  const filteredIds = pokemonIds.filter(id => id.toString().includes(search));

  return (
    // Positioned below the sticky header (approx 73px)
    <div className="fixed top-[73px] left-0 right-0 bottom-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white w-full max-w-7xl max-h-full rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border-4 border-white">
        
        {/* Compact Header Section */}
        <div className="bg-pokemon-blue p-4 md:p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-5">
              <div className="bg-white/20 p-2 rounded-2xl border border-white/30 backdrop-blur-sm shadow-inner shrink-0">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentId}.png`} 
                  className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-md"
                  alt="Current"
                />
              </div>
              <div className="text-white">
                <p className="text-lg md:text-2xl font-black mt-0.5">
                  正在為 <span className="text-yellow-300">#{student.rollNo} {student.name}</span> 更換頭像
                </p>
                <p className="text-xs md:text-sm font-bold opacity-80 tracking-wide mt-1">
                  目前使用的頭像序號：<span className="text-white">#{currentId}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white text-4xl md:text-5xl hover:scale-110 transition-transform p-1 leading-none font-light"
            >
              &times;
            </button>
          </div>
          
          <div className="relative max-w-xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40">🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID (1-500)... / 搜尋序號..."
              className="w-full p-3 pl-11 rounded-xl border-none focus:ring-4 focus:ring-yellow-400 text-base md:text-lg font-bold shadow-lg outline-none text-slate-800 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Grid Section */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-[#F8FAFC]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3 md:gap-4">
            {filteredIds.map(id => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`group p-2 md:p-3 rounded-2xl border-[3px] transition-all hover:scale-105 flex flex-col items-center relative overflow-hidden active:scale-95 ${
                  id === currentId 
                    ? 'border-pokemon-yellow bg-yellow-50 shadow-md ring-2 ring-yellow-100 z-10' 
                    : 'border-white bg-white hover:border-pokemon-blue shadow-sm'
                }`}
              >
                {id === currentId && (
                  <div className="absolute top-0 right-0 bg-pokemon-yellow text-yellow-900 text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg tracking-tighter z-20">
                    Current
                  </div>
                )}
                
                <div className="w-full aspect-square flex items-center justify-center relative">
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
                    alt={`#${id}`}
                    className="w-full h-full object-contain group-hover:rotate-6 transition-transform pointer-events-none"
                    loading="lazy"
                  />
                </div>
                
                <span className={`text-[10px] md:text-[11px] font-black mt-1 ${id === currentId ? 'text-yellow-700' : 'text-slate-400'}`}>
                  #{id}
                </span>
              </button>
            ))}
          </div>
          
          {filteredIds.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <span className="text-5xl opacity-20">🔎</span>
              <div className="text-slate-300 text-lg font-black tracking-widest">
                No Pokemon Found
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-3 text-center text-[10px] text-slate-300 font-bold tracking-widest border-t border-slate-100 shrink-0">
          Miss Iong's Pokemon Lab
        </div>
      </div>
    </div>
  );
};
