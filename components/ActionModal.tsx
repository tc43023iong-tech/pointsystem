
import React, { useState } from 'react';
import { ACTIONS } from '../constants';
import { Student, PointAction } from '../types';

interface ActionModalProps {
  student: Student;
  onClose: () => void;
  onAction: (action: PointAction) => void;
  onManualPoint: (points: number) => void;
}

const EMOJI_MAP: Record<string, string> = {
  "積極參與": "🙋‍♂️",
  "專心上課": "👂",
  "認真學習": "📖",
  "安靜吃飯": "🍱",
  "配合做課間操": "🤸",
  "尊重容老師！": "👩‍🏫",
  "你太讓容老師高興了😊！": "❤️",
  "你簡直太棒了🥳👍！": "🏆",
  "態度欠佳": "😠",
  "過於吵鬧": "📢",
  "離開座位": "🏃",
  "不專心": "💤",
  "課上聊天": "💬",
  "對容老師無禮": "🛑",
  "你太令容老師失望了😢！": "💔",
  "你太過分/離譜了😡！": "⚡"
};

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
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-7xl rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[8px] border-white max-h-[96vh]">
        
        {/* Header - Massive & Clear */}
        <div className="bg-[#F06292] p-6 px-10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-[4px] border-black shadow-sm overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-16 h-16 object-contain"
                alt="Avatar"
              />
            </div>
            <h2 className="text-6xl font-black text-white tracking-tighter">
              <span className="opacity-80 mr-6">#{student.rollNo}</span>
              {student.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-7xl hover:opacity-70 transition-opacity pr-2 leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-10 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col gap-8">
          {/* Manual Input Row */}
          <div className="bg-white p-6 rounded-[2.5rem] border-3 border-dashed border-pink-100 shadow-sm flex items-center gap-10 shrink-0">
            <h4 className="font-black text-pink-400 uppercase text-sm tracking-[0.25em] whitespace-nowrap pl-4">MANUAL / 手動調整</h4>
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-6">
              <input 
                type="number"
                placeholder="輸入加減分數 (例如: 10 或 -5)"
                className="flex-1 p-5 px-10 rounded-3xl bg-pink-50/30 border-2 border-pink-50 focus:border-[#F06292] focus:bg-white outline-none text-2xl font-black transition-all placeholder:text-pink-200"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#F06292] text-white font-black px-12 rounded-3xl hover:bg-[#E91E63] transition-all shadow-lg active:scale-95 whitespace-nowrap text-xl"
              >
                確認應用
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-12 flex-1 overflow-hidden">
            {/* Positive Section - One item per row */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-4 pb-4 mb-6 border-b-4 border-green-100 px-2 shrink-0">
                <span className="text-4xl">✨</span>
                <p className="font-black text-green-600 uppercase tracking-[0.2em] text-xl">POSITIVE / 加分行為</p>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 space-y-4 pb-6">
                {ACTIONS.filter(a => a.type === 'positive').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-6 px-10 rounded-[2.2rem] bg-white border-2 border-slate-50 hover:border-green-300 hover:bg-green-50/50 transition-all text-left group shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-8">
                      <span className="text-5xl shrink-0 drop-shadow-sm">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-3xl leading-none mb-2">{action.labelZh}</span>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-5xl font-black text-green-500 shrink-0 ml-4 tabular-nums">+{action.points}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Section - One item per row */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-4 pb-4 mb-6 border-b-4 border-red-100 px-2 shrink-0">
                <span className="text-4xl">⚠️</span>
                <p className="font-black text-red-600 uppercase tracking-[0.2em] text-xl">NEGATIVE / 減分行為</p>
              </div>
              <div className="flex-1 overflow-y-auto pr-4 space-y-4 pb-6">
                {ACTIONS.filter(a => a.type === 'negative').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-6 px-10 rounded-[2.2rem] bg-white border-2 border-slate-50 hover:border-red-300 hover:bg-red-50/50 transition-all text-left group shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-8">
                      <span className="text-5xl shrink-0 drop-shadow-sm">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-3xl leading-none mb-2">{action.labelZh}</span>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-5xl font-black text-red-500 shrink-0 ml-4 tabular-nums">{action.points}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 text-center text-xs text-pink-200 font-black uppercase tracking-[1em] shrink-0 border-t border-pink-50">
          MISS IONG'S CLASS POINT MANAGER
        </div>
      </div>
    </div>
  );
};
