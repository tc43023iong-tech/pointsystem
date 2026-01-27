
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
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border-[6px] border-white">
        
        {/* Header Area */}
        <div className="bg-[#2196F3] p-6 md:p-8 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-6">
              <div className="bg-white p-3 rounded-3xl shadow-lg shrink-0">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentId}.png`} 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  alt="Current"
                />
              </div>
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                  更換頭像 <span className="text-yellow-300">#{student.rollNo} {student.name}</span>
                </h2>
                <p className="text-sm font-bold opacity-80 tracking-widest mt-1 uppercase">
                  Miss Iong's Pokemon Lab • Currently using #{currentId}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white text-5xl hover:scale-110 transition-transform leading-none px-2 font-light"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
              <input 
                type="text" 
                placeholder="輸入序號搜尋 (1-1025)..."
                className="w-full p-4 pl-12 rounded-2xl border-none focus:ring-4 focus:ring-yellow-400 text-lg font-bold shadow-xl outline-none text-slate-800 transition-all placeholder:opacity-30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Gen Filter Tabs */}
            {!search && (
              <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 no-scrollbar">
                {GENS.map(gen => (
                  <button
                    key={gen.name}
                    onClick={() => setActiveGen(gen.name)}
                    className={`px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap transition-all ${
                      activeGen === gen.name 
                        ? 'bg-yellow-400 text-yellow-900 shadow-lg scale-105' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {gen.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#F8FAFC] custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {filteredIds.map(id => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`group p-3 rounded-[1.5rem] border-[3px] transition-all hover:scale-110 flex flex-col items-center relative active:scale-95 shadow-sm ${
                  id === currentId 
                    ? 'border-yellow-400 bg-yellow-50 ring-4 ring-yellow-100 z-10' 
                    : 'border-white bg-white hover:border-[#2196F3]'
                }`}
              >
                {id === currentId && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[8px] font-black px-2 py-1 rounded-full shadow-sm z-20 border-2 border-white">
                    NOW
                  </div>
                )}
                
                <div className="w-full aspect-square flex items-center justify-center relative mb-1">
                  <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
                    alt={`#${id}`}
                    className="w-full h-full object-contain group-hover:rotate-6 transition-transform pointer-events-none drop-shadow-md"
                    loading="lazy"
                  />
                </div>
                
                <span className={`text-[10px] font-black ${id === currentId ? 'text-yellow-700' : 'text-slate-400'}`}>
                  #{id}
                </span>
              </button>
            ))}
          </div>
          
          {filteredIds.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center gap-4 opacity-20">
              <span className="text-7xl">🔎</span>
              <div className="text-slate-400 text-2xl font-black tracking-widest uppercase">
                Pokemon Not Found
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 text-center border-t border-slate-100 shrink-0">
          <p className="text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase">
            Gotta Catch 'Em All • Miss Iong's Pokemon Academy
          </p>
        </div>
      </div>
    </div>
  );
};
