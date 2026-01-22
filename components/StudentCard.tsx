
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
      className={`relative bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col p-6 border-4 overflow-hidden ${
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

      {/* Header Section: Info & Score */}
      <div className="flex justify-between items-start w-full mb-2 z-30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[#F06292] font-black text-lg">
              #{student.rollNo}
            </span>
            {rank !== undefined && (
              <span className="bg-[#FFD54F] text-[#855C00] text-[9px] px-2 py-0.5 rounded-full font-black shadow-sm">
                RANK {rank}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {student.name}
          </h3>
        </div>

        {/* Score Badge (Right Side) */}
        <div className="flex flex-col items-center justify-center min-w-[58px] min-h-[58px] bg-[#FFF9E1] border-2 border-[#FFE082] rounded-2xl shadow-sm animate-in zoom-in duration-300">
           <span className="text-[#B48A00] text-xs leading-none mt-1">★</span>
           <span className="text-[#855C00] text-2xl font-black leading-tight -mt-0.5 px-2">
             {totalVal}
           </span>
        </div>
      </div>
      
      {/* Avatar Section (Centered & Lowered) */}
      <div 
        className="relative w-full aspect-square max-w-[140px] mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out"
        onClick={onPokemonClick}
      >
        <div className="absolute inset-2 bg-gradient-to-b from-gray-50 to-gray-100/30 rounded-full"></div>
        <img 
          src={pokemonImg} 
          alt="Pokemon" 
          className="w-full h-full object-contain z-10 drop-shadow-2xl relative"
        />

        {!isMultiSelectMode && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] rounded-full z-20 border-2 border-dashed border-pink-200">
            <span className="text-pink-600 text-[10px] font-bold uppercase tracking-widest">Change / 更換</span>
          </div>
        )}
      </div>

      {/* Bottom Points Summary */}
      <div className="w-full grid grid-cols-2 gap-3 mt-auto">
        <div className="bg-green-50/70 border border-green-100 rounded-2xl py-2 px-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter mb-0.5">POS / 加分</span>
          <span className="text-lg font-black text-green-600">+{posVal}</span>
        </div>
        <div className="bg-red-50/70 border border-red-100 rounded-2xl py-2 px-3 flex flex-col items-center justify-center shadow-sm">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mb-0.5">NEG / 減分</span>
          <span className="text-lg font-black text-red-600">-{negVal}</span>
        </div>
      </div>
    </div>
  );
};
