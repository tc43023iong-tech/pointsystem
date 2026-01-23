
import React from 'react';
import { ACADEMIC_ACTIONS } from '../constants';
import { PointAction } from '../types';

interface AcademicActionModalProps {
  title: string;
  onClose: () => void;
  onAction: (action: PointAction) => void;
}

export const AcademicActionModal: React.FC<AcademicActionModalProps> = ({ title, onClose, onAction }) => {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col border-[4px] border-white">
        
        <div className="bg-yellow-400 py-4 px-8 flex justify-between items-center shrink-0 shadow-md">
          <div className="flex items-center gap-4">
            <span className="text-4xl">🔔</span>
            <div className="flex flex-col leading-none">
              <h2 className="text-2xl font-black text-yellow-900 tracking-tighter">
                {title}
              </h2>
              <span className="text-yellow-700 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">
                Academic Achievement / 默書・測驗・考試 獎勵
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
        
        <div className="p-6 bg-yellow-50/30">
          <p className="text-slate-500 font-bold mb-4 text-center text-sm">請選擇分數對應的加分細則：</p>
          
          <div className="grid gap-3">
            {ACADEMIC_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction(action)}
                className="w-full flex justify-between items-center p-4 px-6 rounded-2xl bg-white border-2 border-transparent hover:border-yellow-400 hover:bg-yellow-50 transition-all group shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl group-hover:animate-bounce">🏆</span>
                  <div className="flex flex-col text-left">
                    <span className="font-black text-slate-800 text-xl">{action.labelZh}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{action.labelEn}</span>
                  </div>
                </div>
                <div className="bg-yellow-500 text-white px-5 py-2 rounded-xl text-2xl font-black shadow-sm min-w-[70px] text-center tabular-nums">
                  +{action.points}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-2 text-center text-[8px] text-yellow-600 font-black uppercase tracking-[0.5em] shrink-0 border-t border-yellow-50">
          MISS IONG'S ACADEMIC REWARDS
        </div>
      </div>
    </div>
  );
};
