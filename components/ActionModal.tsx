
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
      <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[6px] border-white">
        
        {/* Header Section - Pink with black-bordered avatar */}
        <div className="bg-[#F06292] p-4 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-[3px] border-black shadow-sm overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-10 h-10 object-contain"
                alt="Avatar"
              />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              #{student.rollNo} {student.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-4xl hover:opacity-70 transition-opacity pr-2 leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 bg-[#FFFBFC] overflow-visible">
          {/* Manual Input Section - More compact height */}
          <div className="mb-6 bg-white p-4 rounded-[2rem] border-2 border-dashed border-pink-100 shadow-sm flex items-center gap-6">
            <div className="shrink-0 pl-2">
              <h4 className="font-black text-pink-400 uppercase text-[10px] tracking-[0.2em]">MANUAL ADJUST / 手動調整</h4>
            </div>
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-3">
              <input 
                type="number"
                placeholder="輸入加減分數 (例如: 10 或 -5)"
                className="flex-1 p-3 px-6 rounded-2xl bg-pink-50/30 border-2 border-pink-50 focus:border-[#F06292] focus:bg-white outline-none text-lg transition-all font-bold placeholder:text-pink-200"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#F06292] text-white font-black px-8 rounded-2xl hover:bg-[#E91E63] transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                確認應用
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Positive Section */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-green-100 px-1">
                <span className="text-xl">✨</span>
                <p className="font-black text-green-600 uppercase tracking-widest text-xs">POSITIVE / 加分行為</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ACTIONS.filter(a => a.type === 'positive').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="flex justify-between items-center p-3 px-4 rounded-2xl bg-white border-2 border-gray-50 hover:border-green-300 hover:bg-green-50/50 transition-all text-left group shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-2xl shrink-0">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-slate-700 text-sm truncate leading-tight">{action.labelZh}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-lg font-black text-green-500 shrink-0 ml-1">+{action.points}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Section */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-3 border-b-2 border-red-100 px-1">
                <span className="text-xl">⚠️</span>
                <p className="font-black text-red-600 uppercase tracking-widest text-xs">NEGATIVE / 減分行為</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ACTIONS.filter(a => a.type === 'negative').map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="flex justify-between items-center p-3 px-4 rounded-2xl bg-white border-2 border-gray-50 hover:border-red-300 hover:bg-red-50/50 transition-all text-left group shadow-sm active:scale-95"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-2xl shrink-0">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-black text-slate-700 text-sm truncate leading-tight">{action.labelZh}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="text-lg font-black text-red-500 shrink-0 ml-1">{action.points}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 text-center text-[10px] text-pink-200 font-black uppercase tracking-[0.5em] shrink-0 border-t border-pink-50">
          MISS IONG'S CLASS POINT MANAGER
        </div>
      </div>
    </div>
  );
};
