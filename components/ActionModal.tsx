
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

  const positiveActions = ACTIONS.filter(a => a.type === 'positive');
  const negativeActions = ACTIONS.filter(a => a.type === 'negative');

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-7xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[6px] border-white max-h-[96vh]">
        
        {/* Header - More Compact Height */}
        <div className="bg-[#F06292] p-4 px-10 flex justify-between items-center shrink-0 shadow-lg z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-12 h-12 object-contain"
                alt="Avatar"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                <span className="opacity-70 mr-3 text-2xl">#{student.rollNo}</span>
                {student.name}
              </h2>
              <span className="text-pink-100 text-xs font-bold tracking-[0.2em] uppercase mt-0.5">Point Action Manager / 課堂獎懲評分</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-6xl hover:scale-110 transition-transform leading-none"
          >
            &times;
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-6 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col gap-5">
          
          {/* Top Row: Manual Input (More Compact) */}
          <section className="bg-white p-4 rounded-[1.8rem] border-2 border-dashed border-pink-100 flex items-center gap-6 shrink-0 shadow-sm mx-2">
            <div className="flex flex-col pl-2">
              <h4 className="font-black text-pink-400 uppercase text-[10px] tracking-[0.3em]">MANUAL INPUT</h4>
              <p className="text-slate-400 font-bold text-sm">手動加減分</p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-4">
              <input 
                type="number"
                placeholder="輸入分數 (例如: 10 或 -5)..."
                className="flex-1 p-3 px-6 rounded-2xl bg-pink-50/20 border-2 border-pink-50 focus:border-[#F06292] focus:bg-white outline-none text-xl font-black transition-all placeholder:text-pink-100"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#F06292] text-white font-black px-10 rounded-2xl hover:bg-[#E91E63] transition-all shadow-md active:scale-95 text-lg"
              >
                確認應用
              </button>
            </form>
          </section>

          {/* Bottom Grid: Tighter gap and spacing */}
          <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden px-2">
            
            {/* Left Column: Positive */}
            <div className="flex flex-col overflow-hidden bg-green-50/30 rounded-[2rem] p-4 border border-green-100">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b-2 border-green-100 px-2 shrink-0">
                <span className="text-3xl">✨</span>
                <div className="flex flex-col">
                  <p className="font-black text-green-600 uppercase tracking-[0.2em] text-[10px] leading-none mb-0.5">POSITIVE ACTIONS</p>
                  <p className="text-xl font-black text-green-700">加分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pb-4 custom-scrollbar">
                {positiveActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-3 px-6 rounded-2xl bg-white border border-slate-100 hover:border-green-300 hover:bg-white transition-all text-left group shadow-sm active:scale-[0.98] border-b-4 active:border-b active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-4xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-xl leading-tight">{action.labelZh}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-green-500 text-white px-5 py-2 rounded-xl text-2xl font-black shadow-sm min-w-[80px] text-center tabular-nums">
                      +{action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Negative */}
            <div className="flex flex-col overflow-hidden bg-red-50/30 rounded-[2rem] p-4 border border-red-100">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b-2 border-red-100 px-2 shrink-0">
                <span className="text-3xl">⚠️</span>
                <div className="flex flex-col">
                  <p className="font-black text-red-600 uppercase tracking-[0.2em] text-[10px] leading-none mb-0.5">NEGATIVE ACTIONS</p>
                  <p className="text-xl font-black text-red-700">減分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 pb-4 custom-scrollbar">
                {negativeActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-3 px-6 rounded-2xl bg-white border border-slate-100 hover:border-red-300 hover:bg-white transition-all text-left group shadow-sm active:scale-[0.98] border-b-4 active:border-b active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-4xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-xl leading-tight">{action.labelZh}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-red-500 text-white px-5 py-2 rounded-xl text-2xl font-black shadow-sm min-w-[80px] text-center tabular-nums">
                      {action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer (Minimal) */}
        <div className="bg-white p-3 text-center text-[10px] text-pink-200 font-black uppercase tracking-[0.5em] shrink-0 border-t border-pink-50">
          Miss Iong's Class Point Manager
        </div>
      </div>
    </div>
  );
};
