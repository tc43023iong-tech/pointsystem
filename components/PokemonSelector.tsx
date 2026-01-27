
import React, { useState, useMemo } from 'react';
import { POKEMON_COUNT } from '../constants';
import { Student } from '../types';

interface PokemonSelectorProps {
  onSelect: (id: number) => void;
  onClose: () => void;
  currentId: number;
  student: Student;
}

const GENS = [
  { name: 'Gen 1', range: [1, 151], zh: '第一世代' },
  { name: 'Gen 2', range: [152, 251], zh: '第二世代' },
  { name: 'Gen 3', range: [252, 386], zh: '第三世代' },
  { name: 'Gen 4', range: [387, 493], zh: '第四世代' },
  { name: 'Gen 5', range: [494, 649], zh: '第五世代' },
  { name: 'Gen 6', range: [650, 721], zh: '第六世代' },
  { name: 'Gen 7', range: [722, 809], zh: '第七世代' },
  { name: 'Gen 8', range: [810, 905], zh: '第八世代' },
  { name: 'Gen 9+', range: [906, 1025], zh: '第九世代' },
];

export const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onSelect, onClose, currentId, student }) => {
  const [search, setSearch] = useState('');
  const [activeGen, setActiveGen] = useState<string>('Gen 1');

  const filteredIds = useMemo(() => {
    const allIds = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1);
    if (search) {
      return allIds.filter(id => id.toString().includes(search));
    }
    const gen = GENS.find(g => g.name === activeGen);
    if (!gen) return allIds.slice(0, 151);
    return allIds.filter(id => id >= gen.range[0] && id <= gen.range[1]);
  }, [search, activeGen]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border-[4px] border-white">
        
        {/* Header Area - Now much more compact */}
        <div className="bg-[#2196F3] px-6 py-4 md:py-5 shrink-0 shadow-lg relative z-10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-md shrink-0 border border-blue-100">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentId}.png`} 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  alt="Current"
                />
              </div>
              <div className="text-white">
                <h2 className="text-xl md:text-2xl font-black tracking-tighter leading-none">
                  更換頭像 <span className="text-yellow-300">#{student.rollNo} {student.name}</span>
                </h2>
                <p className="text-[10px] font-bold opacity-70 tracking-widest mt-1 uppercase">
                  Currently using #{currentId}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white text-4xl hover:scale-110 transition-transform leading-none px-2 font-light"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Search Input - Slimmer */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-40">🔍</span>
              <input 
                type="text" 
                placeholder="搜尋序號 (1-1025)..."
                className="w-full p-2.5 pl-9 rounded-xl border-none focus:ring-4 focus:ring-yellow-400 text-sm font-bold shadow-md outline-none text-slate-800 transition-all placeholder:opacity-30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Gen Filter Tabs - More compact */}
            {!search && (
              <div className="flex overflow-x-auto gap-1.5 pb-1 lg:pb-0 no-scrollbar">
                {GENS.map(gen => (
                  <button
                    key={gen.name}
                    onClick={() => setActiveGen(gen.name)}
                    className={`px-3 py-1.5 rounded-lg font-black text-[10px] whitespace-nowrap transition-all ${
                      activeGen === gen.name 
                        ? 'bg-yellow-400 text-yellow-900 shadow-md scale-105' 
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    {gen.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid Area - Expanded with smaller padding */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#F8FAFC] custom-scrollbar">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
            {filteredIds.map(id => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`group p-2 rounded-2xl border-[2px] transition-all hover:scale-110 flex flex-col items-center relative active:scale-95 shadow-sm ${
                  id === currentId 
                    ? 'border-yellow-400 bg-yellow-50 ring-2 ring-yellow-100 z-10' 
                    : 'border-white bg-white hover:border-[#2196F3]'
                }`}
              >
                {id === currentId && (
                  <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-900 text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm z-20 border-2 border-white">
                    NOW
                  </div>
                )}
                
                <div className="w-full aspect-square flex items-center justify-center relative mb-0.5">
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
                    alt={`#${id}`}
                    className="w-full h-full object-contain group-hover:rotate-6 transition-transform pointer-events-none drop-shadow-sm"
                    loading="lazy"
                  />
                </div>
                
                <span className={`text-[9px] font-black ${id === currentId ? 'text-yellow-700' : 'text-slate-300'}`}>
                  #{id}
                </span>
              </button>
            ))}
          </div>
          
          {filteredIds.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-3 opacity-20">
              <span className="text-6xl">🔎</span>
              <div className="text-slate-400 text-xl font-black tracking-widest uppercase">
                Not Found
              </div>
            </div>
          )}
        </div>
        
        {/* Footer - Minimal */}
        <div className="bg-white p-2 text-center border-t border-slate-50 shrink-0">
          <p className="text-[8px] text-slate-200 font-bold tracking-[0.3em] uppercase">
            Gotta Catch 'Em All • Miss Iong's Lab
          </p>
        </div>
      </div>
    </div>
  );
};
