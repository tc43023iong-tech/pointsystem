
import React, { useState } from 'react';
import { ACTIONS } from '../constants';
import { Student, PointAction, HistoryEntry } from '../types';

interface ActionModalProps {
  student: Student;
  onClose: () => void;
  onAction: (action: PointAction) => void;
  onManualPoint: (points: number) => void;
  onUndoHistory: (entry: HistoryEntry) => void;
}

const EMOJI_MAP: Record<string, string> = {
  "積極參與": "🙋‍♂️",
  "專心上課": "👂",
  "認真學習": "📖",
  "安靜吃飯": "🍱",
  "配合做課間操": "🤸",
  "尊重容老師！": "👩‍🏫",
  "你太讓容老師高興了😊！": "❤️",
  "你簡集太棒了🥳👍！": "🏆",
  "態度欠佳": "😠",
  "過於吵鬧": "📢",
  "離開座位": "🏃",
  "不專心": "💤",
  "課上聊天": "💬",
  "對容老師無禮": "🛑",
  "你太令容老師失望了😢！": "💔",
  "你太過分/離譜了😡！": "⚡"
};

export const ActionModal: React.FC<ActionModalProps> = ({ student, onClose, onAction, onManualPoint, onUndoHistory }) => {
  const [manualValue, setManualValue] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

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

  if (showHistory) {
    return (
      <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col border-[4px] border-white max-h-[80vh]">
          <div className="bg-slate-800 py-4 px-8 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
               <span className="text-2xl">📜</span>
               <h2 className="text-xl font-black text-white">加減分歷史紀錄 - {student.name}</h2>
             </div>
             <button onClick={() => setShowHistory(false)} className="text-white text-3xl font-light">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
            {(!student.history || student.history.length === 0) ? (
              <div className="text-center py-20 text-slate-300 font-bold italic">尚無歷史紀錄</div>
            ) : (
              <div className="space-y-3">
                {[...(student.history || [])].reverse().map((entry, i) => (
                  <div key={entry.timestamp} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm group">
                    <div className="flex flex-col">
                      <span className="text-slate-400 text-[10px] font-bold">
                        {new Date(entry.timestamp).toLocaleString('zh-HK')}
                      </span>
                      <span className="text-slate-700 font-black text-lg">{entry.reason}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`text-xl font-black px-4 py-1 rounded-xl ${entry.delta > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                      </div>
                      <button 
                        onClick={() => onUndoHistory(entry)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 p-2 rounded-xl transition-all active:scale-90 flex items-center gap-1"
                        title="撤銷此操作"
                      >
                        <span className="text-lg font-black">↺</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">撤銷</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white text-center">
            <button 
              onClick={() => setShowHistory(false)}
              className="px-8 py-2 bg-slate-100 rounded-full font-black text-slate-500 hover:bg-slate-200 transition-all"
            >
              返回操作
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[4px] border-white max-h-[96vh]">
        
        {/* Updated Header with Middle Manual Section */}
        <div className="bg-[#F06292] py-4 px-6 flex justify-between items-center shrink-0 shadow-md z-10 gap-6">
          
          {/* Left: Avatar & Name */}
          <div className="flex items-center gap-4 min-w-fit">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-9 h-9 object-contain"
                alt="Avatar"
              />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter whitespace-nowrap">
              {student.rollNo > 0 && <span className="opacity-70 mr-2 text-xl font-bold">#{student.rollNo}</span>}
              {student.name}
            </h2>
          </div>

          {/* Middle: Integrated History & Manual Section */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white p-1.5 px-4 rounded-2xl shadow-inner border border-white/20 flex items-center gap-4 w-full max-w-2xl">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowHistory(true)}
                  className="w-10 h-10 flex items-center justify-center bg-pink-50 text-slate-500 rounded-xl hover:bg-pink-100 transition-all active:scale-95 shadow-sm border border-pink-100 shrink-0"
                  title="查看歷史數據"
                >
                  📜
                </button>
                <div className="hidden sm:flex flex-col leading-none shrink-0 min-w-[50px]">
                  <h4 className="font-black text-[#F06292] uppercase text-[8px] tracking-[0.1em] mb-0.5">MANUAL</h4>
                  <p className="text-slate-400 font-bold text-[10px]">手動輸入</p>
                </div>
              </div>
              
              <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
                <input 
                  type="number"
                  placeholder="輸入分數 (10, -5)..."
                  className="flex-1 p-1 px-4 rounded-lg bg-slate-50 border border-slate-100 focus:border-[#F06292] focus:bg-white outline-none text-base font-black transition-all placeholder:text-slate-300 h-10"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-[#F06292] text-white font-black px-6 rounded-lg hover:bg-[#E91E63] transition-all shadow-sm active:scale-95 text-sm h-10 whitespace-nowrap"
                >
                  確認應用
                </button>
              </form>
            </div>
          </div>

          {/* Right: Close Button */}
          <button 
            onClick={onClose} 
            className="text-white text-5xl hover:scale-110 transition-transform leading-none px-2 min-w-fit"
          >
            &times;
          </button>
        </div>
        
        {/* Main Content Area */}
        <div className="p-6 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col gap-6">
          
          <div className="grid grid-cols-2 gap-8 flex-1 overflow-hidden px-1 w-full">
            
            {/* Positive Actions */}
            <div className="flex flex-col overflow-hidden bg-green-50/10 rounded-[2rem] p-4 border border-green-50 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-green-100 px-1 shrink-0">
                <span className="text-3xl">✨</span>
                <div className="flex flex-col leading-none">
                  <p className="font-black text-green-500 tracking-[0.1em] text-[10px] mb-1 uppercase">Positive Rewards</p>
                  <p className="text-2xl font-black text-green-700 tracking-tight">加分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-2 custom-scrollbar">
                {positiveActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-3 px-5 rounded-2xl bg-white border border-slate-100 hover:border-green-400 hover:bg-green-50 transition-all text-left group shadow-sm active:scale-[0.99] border-b-4 active:border-b-2 active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-800 text-lg">{action.labelZh}</span>
                        <span className="text-[11px] text-slate-400 font-bold tracking-tight uppercase">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl text-xl font-black shadow-sm min-w-[65px] text-center tabular-nums">
                      +{action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Actions */}
            <div className="flex flex-col overflow-hidden bg-red-50/10 rounded-[2rem] p-4 border border-red-50 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-red-100 px-1 shrink-0">
                <span className="text-3xl">⚠️</span>
                <div className="flex flex-col leading-none">
                  <p className="font-black text-red-500 tracking-[0.1em] text-[10px] mb-1 uppercase">Negative Penalties</p>
                  <p className="text-2xl font-black text-red-700 tracking-tight">減分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-2 pb-2 custom-scrollbar">
                {negativeActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-3 px-5 rounded-2xl bg-white border border-slate-100 hover:border-red-400 hover:bg-red-50 transition-all text-left group shadow-sm active:scale-[0.99] border-b-4 active:border-b-2 active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-800 text-lg">{action.labelZh}</span>
                        <span className="text-[11px] text-slate-400 font-bold tracking-tight uppercase">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-red-500 text-white px-4 py-2 rounded-xl text-xl font-black shadow-sm min-w-[65px] text-center tabular-nums">
                      {action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
        
        <div className="bg-white p-2 text-center text-[9px] text-pink-200 font-black uppercase tracking-[0.6em] shrink-0 border-t border-pink-50">
          Miss Iong's Class Point Manager • Gotta Catch 'Em All
        </div>
      </div>
    </div>
  );
};
