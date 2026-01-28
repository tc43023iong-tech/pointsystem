
import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  rank?: number;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
  isNegKingMode?: boolean;
  onClick: () => void;
  onPokemonClick: (e: React.MouseEvent) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  rank, 
  isSelected, 
  isMultiSelectMode, 
  isNegKingMode,
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
          : 'border-transparent hover:border-[#F06292]/40 hover:ring-2 hover:ring-pink-50'
      }`}
      onClick={onClick}
    >
      {/* Deduction King Badge */}
      {isNegKingMode && rank === 1 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1 rounded-b-2xl font-black text-[10px] shadow-md z-40 flex items-center gap-1 border-x-2 border-b-2 border-white animate-bounce">
          <span>👑</span> 扣分大王
        </div>
      )}

      {/* Selection Overlay & Tick Mark */}
      {isMultiSelectMode && isSelected && (
        <>
          <div className="absolute inset-0 bg-pink-500/5 z-20 pointer-events-none"></div>
          {/* Pink Tick Badge */}
          <div className="absolute top-4 right-4 z-40 bg-[#F06292] w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center animate-in zoom-in duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </>
      )}

      {/* Header Section: Info & Score */}
      <div className="flex justify-between items-start w-full mb-2 z-30">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-[#F06292] font-black text-lg">
              #{student.rollNo}
            </span>
            {rank !== undefined && (
              <span className={`${isNegKingMode ? 'bg-slate-200 text-slate-800' : 'bg-[#FFD54F] text-[#855C00]'} text-[9px] px-2 py-0.5 rounded-full font-black shadow-sm`}>
                {isNegKingMode ? `NEG RANK ${rank}` : `RANK ${rank}`}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">
            {student.name}
          </h3>
        </div>

        {/* Score Badge (Right Side) */}
        <div className={`flex flex-col items-center justify-center min-w-[58px] min-h-[58px] ${isNegKingMode ? 'bg-slate-100 border-slate-200' : 'bg-[#FFF9E1] border-[#FFE082]'} border-2 rounded-2xl shadow-sm animate-in zoom-in duration-300`}>
           <span className={`${isNegKingMode ? 'text-slate-400' : 'text-[#B48A00]'} text-xs leading-none mt-1`}>{isNegKingMode ? '⚡' : '★'}</span>
           <span className={`${isNegKingMode ? 'text-slate-800' : 'text-[#855C00]'} text-2xl font-black leading-tight -mt-0.5 px-2`}>
             {isNegKingMode ? `-${negVal}` : totalVal}
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
        <div className={`border rounded-2xl py-2 px-3 flex flex-col items-center justify-center shadow-sm ${isNegKingMode ? 'bg-slate-800 border-slate-900' : 'bg-red-50/70 border-red-100'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-tighter mb-0.5 ${isNegKingMode ? 'text-slate-400' : 'text-red-500'}`}>NEG / 減分</span>
          <span className={`text-lg font-black ${isNegKingMode ? 'text-white' : 'text-red-600'}`}>-{negVal}</span>
        </div>
      </div>
    </div>
  );
};
