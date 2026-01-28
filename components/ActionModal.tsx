
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
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[4px] border-white max-h-[96vh]">
        
        {/* Updated Header with Enlarged Name & Manual Section */}
        <div className="bg-[#F06292] py-5 px-8 flex justify-between items-center shrink-0 shadow-md z-10 gap-8">
          
          {/* Left: Enlarged Avatar & Name */}
          <div className="flex items-center gap-6 min-w-fit">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden shrink-0">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} 
                className="w-12 h-12 object-contain"
                alt="Avatar"
              />
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter whitespace-nowrap">
              {student.rollNo > 0 && <span className="opacity-70 mr-4 text-3xl font-bold">#{student.rollNo}</span>}
              {student.name}
            </h2>
          </div>

          {/* Middle: Integrated History & Manual Section (Compact) */}
          <div className="flex-1 flex items-center justify-center max-w-md">
            <div className="bg-white p-1 px-3 rounded-2xl shadow-inner border border-white/20 flex items-center gap-3 w-full">
              <button 
                onClick={() => setShowHistory(true)}
                className="w-9 h-9 flex items-center justify-center bg-pink-50 text-slate-500 rounded-xl hover:bg-pink-100 transition-all active:scale-95 shadow-sm border border-pink-100 shrink-0"
                title="查看歷史數據"
              >
                📜
              </button>
              
              <form onSubmit={handleManualSubmit} className="flex-1 flex gap-1.5">
                <input 
                  type="number"
                  placeholder="手動輸入分數..."
                  className="flex-1 p-1 px-3 rounded-lg bg-slate-50 border border-slate-100 focus:border-[#F06292] focus:bg-white outline-none text-sm font-black transition-all placeholder:text-slate-300 h-9"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-[#F06292] text-white font-black px-4 rounded-lg hover:bg-[#E91E63] transition-all shadow-sm active:scale-95 text-xs h-9 whitespace-nowrap"
                >
                  確認應用
                </button>
              </form>
            </div>
          </div>

          {/* Right: Close Button */}
          <button 
            onClick={onClose} 
            className="text-white text-6xl hover:scale-110 transition-transform leading-none px-2 min-w-fit pb-2"
          >
            &times;
          </button>
        </div>
        
        {/* Main Content Area (More Compact) */}
        <div className="p-4 bg-[#FFFBFC] flex-1 overflow-hidden flex flex-col gap-4">
          
          <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden px-1 w-full">
            
            {/* Positive Actions */}
            <div className="flex flex-col overflow-hidden bg-green-50/10 rounded-[1.5rem] p-3 border border-green-50 shadow-sm">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-green-100 px-1 shrink-0">
                <span className="text-2xl">✨</span>
                <div className="flex flex-col leading-none">
                  <p className="font-black text-green-500 tracking-[0.1em] text-[8px] mb-1 uppercase">Positive Rewards</p>
                  <p className="text-xl font-black text-green-700 tracking-tight">加分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 pb-2 custom-scrollbar">
                {positiveActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-2 px-4 rounded-xl bg-white border border-slate-100 hover:border-green-400 hover:bg-green-50 transition-all text-left group shadow-sm active:scale-[0.99] border-b-2 active:border-b active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭐'}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-800 text-base">{action.labelZh}</span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-tight">{action.labelEn}</span>
                      </div>
                    </div>
                    <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-lg font-black shadow-sm min-w-[55px] text-center tabular-nums">
                      +{action.points}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Actions */}
            <div className="flex flex-col overflow-hidden bg-red-50/10 rounded-[1.5rem] p-3 border border-red-50 shadow-sm">
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-red-100 px-1 shrink-0">
                <span className="text-2xl">⚠️</span>
                <div className="flex flex-col leading-none">
                  <p className="font-black text-red-500 tracking-[0.1em] text-[8px] mb-1 uppercase">Negative Penalties</p>
                  <p className="text-xl font-black text-red-700 tracking-tight">減分項目</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 pb-2 custom-scrollbar">
                {negativeActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => onAction(action)}
                    className="w-full flex justify-between items-center p-2 px-4 rounded-xl bg-white border border-slate-100 hover:border-red-400 hover:bg-red-50 transition-all text-left group shadow-sm active:scale-[0.99] border-b-2 active:border-b active:translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0 drop-shadow-sm group-hover:scale-110 transition-transform">{EMOJI_MAP[action.labelZh] || '⭕'}</span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-slate-800 text-base">{action.labelZh}</span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-tight">{action.labelEn}</span>
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
        
        <div className="bg-white p-2 text-center text-[8px] text-pink-200 font-black uppercase tracking-[0.5em] shrink-0 border-t border-pink-50">
          Miss Iong's Class Point Manager
        </div>
      </div>
    </div>
  );
};
