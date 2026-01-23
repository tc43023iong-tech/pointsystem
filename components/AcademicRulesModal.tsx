
import React from 'react';

interface AcademicRulesModalProps {
  onClose: () => void;
}

export const AcademicRulesModal: React.FC<AcademicRulesModalProps> = ({ onClose }) => {
  const rules = [
    { range: "100或以上", points: "+25" },
    { range: "90～99", points: "+20" },
    { range: "80～89", points: "+15" },
    { range: "70～79", points: "+10" },
    { range: "60～69", points: "+5" },
  ];

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[4px] border-white">
        
        <div className="bg-yellow-400 py-4 px-8 flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔔</span>
            <div className="flex flex-col leading-none">
              <h2 className="text-2xl font-black text-yellow-900 tracking-tighter">
                默書/測驗/考試 加分細則
              </h2>
              <span className="text-yellow-700 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                Academic Scoring Rules
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-yellow-900 text-4xl hover:scale-110 transition-transform leading-none px-2"
          >
            &times;
          </button>
        </div>
        
        <div className="p-8 bg-yellow-50/30">
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-yellow-100 shadow-sm"
              >
                <span className="text-2xl font-black text-slate-700 tracking-tight">
                  {rule.range}
                </span>
                <span className="text-3xl font-black text-yellow-500 tabular-nums">
                  {rule.points}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-white/50 rounded-xl border border-dashed border-yellow-200 text-center">
            <p className="text-yellow-800 font-bold text-sm italic">
              "努力學習，爭取優異成績！"
            </p>
          </div>
        </div>
        
        <div className="bg-white p-2 text-center text-[8px] text-yellow-600 font-black uppercase tracking-[0.5em] shrink-0 border-t border-yellow-50">
          MISS IONG'S ACADEMIC REWARDS GUIDE
        </div>
      </div>
    </div>
  );
};
