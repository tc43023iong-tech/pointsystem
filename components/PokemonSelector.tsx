
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-7xl max-h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
        {/* Header Section */}
        <div className="bg-pokemon-blue p-6 md:p-8 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-2 rounded-2xl border-2 border-white/30 backdrop-blur-sm shadow-inner shrink-0">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentId}.png`} 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-md"
                  alt="Current"
                />
              </div>
              <div className="text-white">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">Choose New Pokemon</h2>
                <p className="text-blue-100 font-bold text-base md:text-xl mt-1">
                  正在為 <span className="text-yellow-300">#{student.rollNo} {student.name}</span> 更換頭像
                </p>
                <p className="text-[10px] md:text-sm font-bold opacity-80 uppercase tracking-widest mt-1">
                  目前使用的頭像序號：<span className="text-white">#{currentId}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white text-5xl md:text-6xl hover:scale-110 transition-transform p-2 leading-none">&times;</button>
          </div>
          
          <div className="relative max-w-2xl">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID (1-500)... / 搜尋序號..."
              className="w-full p-4 pl-14 rounded-2xl border-none focus:ring-8 focus:ring-yellow-400 text-lg md:text-xl font-bold shadow-2xl outline-none text-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Grid Section - Fixed Distortion */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F8FAFC]">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-4 md:gap-6">
            {filteredIds.map(id => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`group p-3 md:p-4 rounded-3xl border-[3px] transition-all hover:scale-105 flex flex-col items-center relative overflow-hidden active:scale-95 ${
                  id === currentId 
                    ? 'border-pokemon-yellow bg-yellow-50 shadow-lg ring-4 ring-yellow-200 z-10' 
                    : 'border-white bg-white hover:border-pokemon-blue shadow-sm'
                }`}
              >
                {id === currentId && (
                  <div className="absolute top-0 right-0 bg-pokemon-yellow text-yellow-900 text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-tighter z-20">
                    CURRENT
                  </div>
                )}
                
                {/* Image Container with Fixed Proportions */}
                <div className="w-full aspect-square flex items-center justify-center relative">
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
                    alt={`#${id}`}
                    className="w-full h-full object-contain group-hover:rotate-6 transition-transform pointer-events-none"
                    loading="lazy"
                  />
                </div>
                
                <span className={`text-[11px] md:text-[13px] font-black mt-2 md:mt-3 ${id === currentId ? 'text-yellow-700' : 'text-slate-400'}`}>
                  #{id}
                </span>
              </button>
            ))}
          </div>
          
          {filteredIds.length === 0 && (
            <div className="py-24 md:py-32 text-center flex flex-col items-center gap-4">
              <span className="text-5xl md:text-7xl opacity-20">🔎</span>
              <div className="text-slate-300 text-xl md:text-2xl font-black uppercase tracking-widest">
                No Pokemon Found / 找不到相關序號
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-3 md:p-4 text-center text-[10px] md:text-[11px] text-slate-300 font-black uppercase tracking-[0.5em] md:tracking-[1em] border-t border-slate-100 shrink-0">
          Miss Iong's Pokemon Lab
        </div>
      </div>
    </div>
  );
};
