
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
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[6px] border-white max-h-[98vh]">
        
        {/* Header - Compact and Accurate */}
        <div className="bg-[#F06292] p-3 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-[2.5px] border-black shadow-sm overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-8 h-8 object-contain"
                alt="Avatar"
              />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              #{student.rollNo} {student.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-3xl hover:opacity-70 transition-opacity pr-1 leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-4 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col">
          {/* Manual Input - Very Compact Row */}
          <div className="mb-4 bg-white p-3 rounded-[1.5rem] border-2 border-dashed border-pink-100 shadow-sm flex items-center gap-4 shrink-0">
            <h4 className="font-black text-pink-400 uppercase text-[9px] tracking-[0.2em] whitespace-nowrap pl-2">MANUAL / 手動調整</h4>
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
              <input 
                type="number"
                placeholder="輸入加減分數 (例如: 10 或 -5)"
                className="flex-1 p-2 px-5 rounded-xl bg-pink-50/30 border-2 border-pink-50 focus:border-[#F06292] focus:bg-white outline-none text-base transition-all font-bold placeholder:text-pink-200"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#F06292] text-white font-black px-6 rounded-xl hover:bg-[#E91E63] transition-all shadow-md active:scale-95 whitespace-nowrap text-sm"
              >
                確認應用
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
            {/* Positive Section */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 pb-1.5 mb-2 border-b-2 border-green-100 px-1 shrink-0">
                <span className="text-lg">✨</span>
                <p className="font-black text-green-600 uppercase tracking-widest text-[10px]">POSITIVE / 加分行為</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                {ACTIONS.filter(a => a.type === 'positive').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="flex justify-between items-center p-2.5 px-3 rounded-xl bg-white border-2 border-gray-50 hover:border-green-300 hover:bg-green-50/50 transition-all text-left group shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xl shrink-0">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-slate-700 text-xs truncate leading-none">{action.labelZh}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase truncate mt-0.5">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-base font-black text-green-500 shrink-0 ml-1">+{action.points}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Section */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 pb-1.5 mb-2 border-b-2 border-red-100 px-1 shrink-0">
                <span className="text-lg">⚠️</span>
                <p className="font-black text-red-600 uppercase tracking-widest text-[10px]">NEGATIVE / 減分行為</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                {ACTIONS.filter(a => a.type === 'negative').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="flex justify-between items-center p-2.5 px-3 rounded-xl bg-white border-2 border-gray-50 hover:border-red-300 hover:bg-red-50/50 transition-all text-left group shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xl shrink-0">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-slate-700 text-xs truncate leading-none">{action.labelZh}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase truncate mt-0.5">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-base font-black text-red-500 shrink-0 ml-1">{action.points}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-2 text-center text-[9px] text-pink-200 font-black uppercase tracking-[0.5em] shrink-0 border-t border-pink-50">
          MISS IONG'S CLASS POINT MANAGER
        </div>
      </div>
    </div>
  );
};
