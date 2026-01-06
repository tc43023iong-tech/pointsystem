
import React, { useState } from 'react';
import { ACTIONS } from '../constants';
import { Student, PointAction } from '../types';

interface ActionModalProps {
  student: Student;
  onClose: () => void;
  onAction: (action: PointAction) => void;
  onManualPoint: (points: number) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({ student, onClose, onAction, onManualPoint }) => {
  const [manualValue, setManualValue] = useState<string>('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      onManualPoint(val);
      setManualValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-pokemon-red p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-black">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-10 h-10"
              />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight">
              #{student.rollNo} {student.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-white text-3xl hover:scale-110 transition-transform">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200">
            <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-3">MANUAL INPUT / 手動輸入分數</h4>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input 
                type="number"
                placeholder="Enter points (e.g. 10 or -5)..."
                className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-pokemon-blue outline-none text-lg"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-pokemon-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Apply / 應用
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Positive Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-green-200">
                <span className="text-2xl">⭐</span>
                <p className="font-black text-green-600 uppercase tracking-widest">POSITIVE / 加分行為</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {ACTIONS.filter(a => a.type === 'positive').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-3 rounded-xl bg-green-50 border-2 border-green-100 hover:border-green-500 hover:bg-green-100 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-green-800 text-sm">{action.labelZh}</div>
                      <div className="text-[10px] text-green-600 italic uppercase">{action.labelEn}</div>
                    </div>
                    <div className="text-lg font-black text-green-600 group-hover:scale-125 transition-transform">+{action.points}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-red-200">
                <span className="text-2xl">⚠️</span>
                <p className="font-black text-red-600 uppercase tracking-widest">NEGATIVE / 減分行為</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {ACTIONS.filter(a => a.type === 'negative').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-3 rounded-xl bg-red-50 border-2 border-red-100 hover:border-red-500 hover:bg-red-100 transition-all text-left group"
                  >
                    <div>
                      <div className="font-bold text-red-800 text-sm">{action.labelZh}</div>
                      <div className="text-[10px] text-red-600 italic uppercase">{action.labelEn}</div>
                    </div>
                    <div className="text-lg font-black text-red-600 group-hover:scale-125 transition-transform">{action.points}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-100 p-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest shrink-0">
          Command Menu System v2.0 - Miss Iong's Class
        </div>
      </div>
    </div>
  );
};
