
import React from 'react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  rank?: number;
  onClick: () => void;
  onPokemonClick: (e: React.MouseEvent) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, rank, onClick, onPokemonClick }) => {
  const pokemonImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${student.pokemonId}.png`;

  const posVal = student.posPoints || 0;
  const negVal = student.negPoints || 0;
  const totalVal = student.points || 0;

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group flex flex-col items-center p-4 border-2 border-transparent hover:border-pokemon-blue relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute top-2 left-2 bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
        #{student.rollNo}
      </div>

      {rank !== undefined && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm ring-2 ring-yellow-200">
          RANK {rank}
        </div>
      )}
      
      <div 
        className="relative w-28 h-28 mt-2 mb-3 bg-gray-50 rounded-full flex items-center justify-center border-4 border-gray-100 group-hover:bg-yellow-50 transition-colors"
        onClick={onPokemonClick}
      >
        <img 
          src={pokemonImg} 
          alt="Pokemon" 
          className="w-24 h-24 object-contain z-10 drop-shadow-md group-hover:scale-110 transition-transform"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-full z-20">
          <span className="text-white text-[9px] font-bold uppercase">Change / 更換</span>
        </div>
      </div>

      <div className="text-center mb-3">
        <h3 className="text-lg font-bold text-gray-800 leading-tight">
          {student.name} <span className={`text-sm font-black ml-1 ${totalVal >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>({totalVal})</span>
        </h3>
      </div>
      
      <div className="w-full grid grid-cols-2 gap-2 mt-auto">
        <div className="bg-green-50 border border-green-100 rounded-lg p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-green-400 uppercase tracking-tighter">Pos / 加分</span>
          <span className="text-sm font-black text-green-600">+{posVal}</span>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-2 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Neg / 減分</span>
          <span className="text-sm font-black text-red-600">-{negVal}</span>
        </div>
      </div>
    </div>
  );
};
