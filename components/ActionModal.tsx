
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
      <div className="bg-white w-full max-w-7xl rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[4px] border-white max-h-[94vh]">
        
        {/* Header - Ultra Compact */}
        <div className="bg-[#F06292] p-2 px-8 flex justify-between items-center shrink-0 shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-8 h-8 object-contain"
                alt="Avatar"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <h2 className="text-2xl font-black text-white tracking-tighter">
                <span className="opacity-70 mr-2 text-lg">#{student.rollNo}</span>
                {student.name}
              </h2>
              <span className="text-pink-100 text-[8px] font-bold tracking-[0.2em] uppercase">Point Manager / 獎懲管理系統</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-5xl hover:scale-110 transition-transform leading-none px-2"
          >
            &times;
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-4 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col gap-3">
          
          {/* Top Row: Manual Input (Ultra Tight) */}
          <section className="bg-white p-1.5 px-5 rounded-2xl border border-dashed border-pink-200 flex items-center gap-4 shrink-0 shadow-sm mx-1">
            <div className="flex flex-col shrink-0 min-w-[60px] leading-none">
              <h4 className="font-black text-pink-400 uppercase text-[8px] tracking-[0.1em] mb-0.5">MANUAL</h4>
              <p className="text-slate-400 font-bold text-[10px]">手動輸入</p>
            </div>
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
              <input 
                type="number"
                placeholder="輸入分數 (10, -5)..."
                className="flex-1 p-1 px-4 rounded-lg bg-pink-50/10 border border-pink-100 focus:border-[#F06292] focus:bg-white outline-none text-base font-black transition-all placeholder:text-pink-100 h-9"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-[#F06292] text-white font-black px-6 rounded-lg hover:bg-[#E91E63] transition-all shadow-sm active:scale-95 text-sm h-9"
              >
                確認應用
              </button>
            </form>
          </section>

          {/* Bottom Grid: Tighter gap */}
          <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden px-1">
            
            {/* Left Column: Positive */}
            <div className="flex flex-col overflow-hidden bg-green-50/10 rounded-[1.5rem] p-3 border border-green-50">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-green-100 px-1 shrink-0">
                <span className="text-xl">✨</span>
                <div className="flex flex-col leading-none">
                  <p className="font-black text-green-600 uppercase tracking-[0.1em] text-[8px] mb-0.5">POSITIVE</p>
                  <p className="text-base font-black text-green-700">加分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-1 pb-1 custom-scrollbar">
                {positiveActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-1.5 px-4 rounded-xl bg-white border border-slate-50 hover:border-green-400 hover:bg-green-50 transition-all text-left group shadow-sm active:scale-[0.99] border-b-2 active:border-b active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-800 text-base">{action.labelZh}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-lg font-black shadow-sm min-w-[55px] text-center tabular-nums">
                      +{action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Negative */}
            <div className="flex flex-col overflow-hidden bg-red-50/10 rounded-[1.5rem] p-3 border border-red-50">
              <div className="flex items-center gap-2 pb-2 mb-2 border-b border-red-100 px-1 shrink-0">
                <span className="text-xl">⚠️</span>
                <div className="flex flex-col leading-none">
                  <p className="font-black text-red-600 uppercase tracking-[0.1em] text-[8px] mb-0.5">NEGATIVE</p>
                  <p className="text-base font-black text-red-700">減分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-1 pb-1 custom-scrollbar">
                {negativeActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-1.5 px-4 rounded-xl bg-white border border-slate-50 hover:border-red-400 hover:bg-red-50 transition-all text-left group shadow-sm active:scale-[0.99] border-b-2 active:border-b active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-800 text-base">{action.labelZh}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-lg font-black shadow-sm min-w-[55px] text-center tabular-nums">
                      {action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        {/* Footer (Minimal) */}
        <div className="bg-white p-2 text-center text-[8px] text-pink-200 font-black uppercase tracking-[0.5em] shrink-0 border-t border-pink-50">
          Miss Iong's Class Point Manager
        </div>
      </div>
    </div>
  );
};
