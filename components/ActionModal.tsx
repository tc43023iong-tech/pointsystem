
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
      <div className="bg-white w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[8px] border-white max-h-[96vh]">
        
        {/* Header - Larger Text */}
        <div className="bg-[#F06292] p-5 px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-[3.5px] border-black shadow-sm overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-12 h-12 object-contain"
                alt="Avatar"
              />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              #{student.rollNo} {student.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-5xl hover:opacity-70 transition-opacity pr-2 leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-8 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col gap-6">
          {/* Manual Input - More substantial row */}
          <div className="bg-white p-5 rounded-[2rem] border-3 border-dashed border-pink-100 shadow-sm flex items-center gap-8 shrink-0">
            <h4 className="font-black text-pink-400 uppercase text-xs tracking-[0.25em] whitespace-nowrap pl-4">MANUAL / 手動調整</h4>
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-4">
              <input 
                type="number"
                placeholder="輸入加減分數 (例如: 10 或 -5)"
                className="flex-1 p-4 px-8 rounded-2xl bg-pink-50/30 border-2 border-pink-50 focus:border-[#F06292] focus:bg-white outline-none text-xl transition-all font-bold placeholder:text-pink-200"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#F06292] text-white font-black px-10 rounded-2xl hover:bg-[#E91E63] transition-all shadow-lg active:scale-95 whitespace-nowrap text-lg"
              >
                確認應用
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-10 flex-1 overflow-hidden">
            {/* Positive Section */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 pb-3 mb-4 border-b-3 border-green-100 px-2 shrink-0">
                <span className="text-2xl">✨</span>
                <p className="font-black text-green-600 uppercase tracking-widest text-sm">POSITIVE / 加分行為</p>
              </div>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 pb-4">
                {ACTIONS.filter(a => a.type === 'positive').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="flex justify-between items-center p-4 px-6 rounded-2xl bg-white border-2 border-gray-50 hover:border-green-300 hover:bg-green-50/50 transition-all text-left group shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-3xl shrink-0">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-slate-700 text-lg truncate leading-tight">{action.labelZh}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase truncate mt-0.5 tracking-wider">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-green-500 shrink-0 ml-2">+{action.points}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Section */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 pb-3 mb-4 border-b-3 border-red-100 px-2 shrink-0">
                <span className="text-2xl">⚠️</span>
                <p className="font-black text-red-600 uppercase tracking-widest text-sm">NEGATIVE / 減分行為</p>
              </div>
              <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 pb-4">
                {ACTIONS.filter(a => a.type === 'negative').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="flex justify-between items-center p-4 px-6 rounded-2xl bg-white border-2 border-gray-50 hover:border-red-300 hover:bg-red-50/50 transition-all text-left group shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-3xl shrink-0">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-slate-700 text-lg truncate leading-tight">{action.labelZh}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase truncate mt-0.5 tracking-wider">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-red-500 shrink-0 ml-2">{action.points}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 text-center text-[11px] text-pink-200 font-black uppercase tracking-[0.6em] shrink-0 border-t border-pink-50">
          MISS IONG'S CLASS POINT MANAGER
        </div>
      </div>
    </div>
  );
};
