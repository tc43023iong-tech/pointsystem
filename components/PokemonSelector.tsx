
import React, { useState } from 'react';
import { POKEMON_COUNT } from '../constants';

interface PokemonSelectorProps {
  onSelect: (id: number) => void;
  onClose: () => void;
  currentId: number;
}

export const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onSelect, onClose, currentId }) => {
  const [search, setSearch] = useState('');
  
  const pokemonIds = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1);
  const filteredIds = pokemonIds.filter(id => id.toString().includes(search));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-pokemon-blue p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white uppercase">Choose Your Pokemon / 選擇寶可夢</h2>
            <button onClick={onClose} className="text-white text-3xl">&times;</button>
          </div>
          <input 
            type="text" 
            placeholder="Search by ID (1-500)... / 搜尋 ID..."
            className="w-full p-3 rounded-xl border-none focus:ring-4 focus:ring-blue-300 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredIds.map(id => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`p-2 rounded-2xl border-4 transition-all hover:scale-105 bg-white flex flex-col items-center ${id === currentId ? 'border-pokemon-yellow' : 'border-transparent'}`}
              >
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
                  alt={`#${id}`}
                  className="w-20 h-20"
                  loading="lazy"
                />
                <span className="text-xs font-bold text-gray-400">#{id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
