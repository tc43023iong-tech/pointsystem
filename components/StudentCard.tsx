
import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  rank?: number;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
  onClick: () => void;
  onPokemonClick: (e: React.MouseEvent) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  rank, 
  isSelected, 
  isMultiSelectMode, 
  onClick, 
  onPokemonClick 
}) => {
  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  const posVal = student.posPoints || 0;
  const negVal = student.negPoints || 0;
  const totalVal = student.points || 0;

  return (
    <div 
      className={`relative bg-white rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col items-center p-5 border-4 overflow-hidden ${
        isSelected 
          ? 'border-[#F06292] ring-4 ring-pink-50 scale-[1.02] z-10' 
          : 'border-transparent hover:border-pink-100'
      }`}
      onClick={onClick}
    >
      {/* Selection Overlay */}
      {isMultiSelectMode && isSelected && (
        <div className="absolute inset-0 bg-pink-500/5 z-20 pointer-events-none"></div>
      )}

      {/* Top Left Area: Roll No & Rank */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 items-start z-30">
        <div className="bg-gray-100 text-gray-500 text-[10px] px-2.5 py-1 rounded-full font-bold">
          #{student.rollNo}
        </div>
        {rank !== undefined && (
          <div className="bg-[#FFD54F] text-[#855C00] text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm border border-yellow-200 animate-in slide-in-from-left-2">
            RANK {rank}
          </div>
        )}
      </div>

      {/* Top Right Area: Score Badge (Based on User Image) */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-center justify-center min-w-[54px] min-h-[54px] bg-[#FFF9E1] border-2 border-[#FFE082] rounded-[1.2rem] shadow-md animate-in zoom-in duration-300">
         <span className="text-[#B48A00] text-sm leading-none mt-1">★</span>
         <span className="text-[#855C00] text-2xl font-bold leading-tight -mt-0.5 px-2">
           {totalVal}
         </span>
      </div>
      
      {/* Avatar Section (Now Clear) */}
      <div 
        className="relative w-32 h-32 mt-6 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        onClick={onPokemonClick}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100/50 rounded-full"></div>
        <img 
          src={pokemonImg} 
          alt="Pokemon" 
          className="w-28 h-28 object-contain z-10 drop-shadow-xl relative"
        />

        {!isMultiSelectMode && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-full z-20 border-2 border-dashed border-pink-200">
            <span className="text-pink-600 text-[10px] font-bold uppercase tracking-widest">Change / 更換</span>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">
          {student.name}
        </h3>
      </div>
      
      <div className="w-full grid grid-cols-2 gap-2 mt-auto">
        <div className="bg-green-50/50 border border-green-100/50 rounded-2xl p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-green-400 uppercase tracking-tighter mb-0.5">Pos / 加分</span>
          <span className="text-sm font-black text-green-600">+{posVal}</span>
        </div>
        <div className="bg-red-50/50 border border-red-100/50 rounded-2xl p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter mb-0.5">Neg / 減分</span>
          <span className="text-sm font-black text-red-600">-{negVal}</span>
        </div>
      </div>
    </div>
  );
};
