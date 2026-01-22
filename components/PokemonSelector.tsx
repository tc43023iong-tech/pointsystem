
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
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
        {/* Header Section */}
        <div className="bg-pokemon-blue p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-2xl border-2 border-white/30 backdrop-blur-sm">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentId}.png`} 
                  className="w-16 h-16 object-contain drop-shadow-md"
                  alt="Current"
                />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-black uppercase tracking-tight">Choose New Pokemon</h2>
                <p className="text-blue-100 font-bold text-lg mt-1">
                  正在為 <span className="text-yellow-300">#{student.rollNo} {student.name}</span> 更換頭像
                </p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-0.5">
                  目前使用的頭像序號：<span className="text-white">#{currentId}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white text-4xl hover:scale-110 transition-transform">&times;</button>
          </div>
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
            <input 
              type="text" 
              placeholder="Search by ID (1-500)... / 搜尋序號..."
              className="w-full p-4 pl-12 rounded-2xl border-none focus:ring-4 focus:ring-yellow-400 text-lg shadow-inner outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredIds.map(id => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`group p-3 rounded-2xl border-4 transition-all hover:scale-105 flex flex-col items-center relative overflow-hidden ${
                  id === currentId 
                    ? 'border-pokemon-yellow bg-yellow-50 shadow-md ring-2 ring-yellow-200' 
                    : 'border-white bg-white hover:border-pokemon-blue'
                }`}
              >
                {id === currentId && (
                  <div className="absolute top-0 right-0 bg-pokemon-yellow text-yellow-900 text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">
                    CURRENT / 目前
                  </div>
                )}
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
                  alt={`#${id}`}
                  className="w-20 h-20 group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
                <span className={`text-xs font-black mt-2 ${id === currentId ? 'text-yellow-700' : 'text-gray-400'}`}>
                  #{id}
                </span>
              </button>
            ))}
          </div>
          
          {filteredIds.length === 0 && (
            <div className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">
              No Pokemon Found / 找不到相關序號
            </div>
          )}
        </div>
        
        <div className="bg-gray-100 p-3 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-200">
          Miss Iong's Pokemon Lab
        </div>
      </div>
    </div>
  );
};
