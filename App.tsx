
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_CLASSES } from './constants';
import { Student, ClassData, SortType, PointAction } from './types';
import { StudentCard } from './components/StudentCard';
import { ActionModal } from './components/ActionModal';
import { PokemonSelector } from './components/PokemonSelector';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { audioService } from './audioService';

const App: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>(SortType.ID_ASC);
  
  // Modals & Overlays
  const [actingStudent, setActingStudent] = useState<Student | null>(null);
  const [bulkActing, setBulkActing] = useState<boolean>(false);
  const [pokeselStudent, setPokeselStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<{ student: Student, type: 'positive' | 'negative', reason?: string, delta: number } | null>(null);
  
  // Multi-select State
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Random Picker State
  const [pickedIdsMap, setPickedIdsMap] = useState<Record<string, string[]>>({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState<number>(-1);
  const [shufflingWinner, setShufflingWinner] = useState<Student | null>(null);

  // Refs for auto-scrolling
  const studentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize data
  useEffect(() => {
    const saved = localStorage.getItem('miss_iong_class_data');
    const savedPicked = localStorage.getItem('miss_iong_picked_history');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClasses(parsed);
        if (parsed.length > 0) setSelectedClassId(parsed[0].id);
      } catch (e) {
        setClasses(INITIAL_CLASSES);
        setSelectedClassId(INITIAL_CLASSES[0].id);
      }
    } else {
      setClasses(INITIAL_CLASSES);
      setSelectedClassId(INITIAL_CLASSES[0].id);
    }

    if (savedPicked) {
      try { setPickedIdsMap(JSON.parse(savedPicked)); } catch(e) {}
    }
  }, []);

  // Persist data
  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem('miss_iong_class_data', JSON.stringify(classes));
    }
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('miss_iong_picked_history', JSON.stringify(pickedIdsMap));
  }, [pickedIdsMap]);

  // Handle auto-scrolling when shuffleIndex changes
  useEffect(() => {
    if (isShuffling && shuffleIndex >= 0 && studentRefs.current[shuffleIndex]) {
      studentRefs.current[shuffleIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [shuffleIndex, isShuffling]);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const students = currentClass?.students || [];

  const filteredAndSortedStudents = useMemo(() => {
    let list = [...students];
    if (searchQuery) {
      list = list.filter(s => s.name.includes(searchQuery) || s.rollNo.toString().includes(searchQuery));
    }
    
    switch (sortType) {
      case SortType.ID_ASC: list.sort((a, b) => a.rollNo - b.rollNo); break;
      case SortType.SCORE_DESC: list.sort((a, b) => b.points - a.points); break;
      case SortType.SCORE_ASC: list.sort((a, b) => a.points - b.points); break;
      case SortType.NAME_ASC: list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [students, searchQuery, sortType]);

  const updateStudentPoints = (studentIds: string[], points: number, labelZh?: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id !== selectedClassId) return c;
      return {
        ...c,
        students: c.students.map(s => {
          if (!studentIds.includes(s.id)) return s;
          const isPos = points > 0;
          return {
            ...s,
            points: s.points + points,
            posPoints: isPos ? s.posPoints + points : s.posPoints,
            negPoints: !isPos ? s.negPoints + Math.abs(points) : s.negPoints
          };
        })
      };
    }));

    if (studentIds.length === 1) {
      const s = students.find(x => x.id === studentIds[0]);
      if (s) {
        setFeedback({ 
          student: { ...s, points: s.points + points }, 
          type: points > 0 ? 'positive' : 'negative', 
          reason: labelZh, 
          delta: points 
        });
        if (points > 0) audioService.playPointUp();
        else audioService.playPointDown();
      }
    } else {
      setFeedback({
        student: { id: 'group', name: '所選學生團隊', points: 0, rollNo: 0, pokemonId: 25 } as any,
        type: points > 0 ? 'positive' : 'negative',
        reason: labelZh || '集體獎勵',
        delta: points
      });
      if (points > 0) audioService.playPointUp();
      else audioService.playPointDown();
    }
  };

  const pickRandom = () => {
    if (students.length === 0 || isShuffling) return;
    
    const classPickedHistory = pickedIdsMap[selectedClassId] || [];
    const pool = students.filter(s => !classPickedHistory.includes(s.id));
    const effectivePool = pool.length > 0 ? pool : students;
    
    setIsShuffling(true);
    let count = 0;
    const totalTicks = 20;
    
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * filteredAndSortedStudents.length);
      setShuffleIndex(idx);
      audioService.playShuffleTick(count, totalTicks);
      count++;
      
      if (count >= totalTicks) {
        clearInterval(interval);
        const winner = effectivePool[Math.floor(Math.random() * effectivePool.length)];
        const winnerIdx = filteredAndSortedStudents.findIndex(s => s.id === winner.id);
        setShuffleIndex(winnerIdx);
        setShufflingWinner(winner);
        audioService.playShuffleSuccess();
        
        setPickedIdsMap(prev => ({
          ...prev,
          [selectedClassId]: pool.length > 0 ? [...classPickedHistory, winner.id] : [winner.id]
        }));

        setTimeout(() => {
          setIsShuffling(false);
          setShuffleIndex(-1);
          setActingStudent(winner);
          setShufflingWinner(null);
        }, 1200);
      }
    }, 100);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(classes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `miss_iong_points_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setClasses(parsed);
          alert('數據導入成功！Data Imported!');
        } catch(e) { alert('導入失敗。Invalid file.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const btnBase = "px-4 py-1.5 rounded-full font-black text-xs transition-all shadow-sm border-2 flex items-center justify-center gap-2 active:scale-95";
  const btnWhite = `${btnBase} bg-white text-[#F06292] border-pink-100 hover:border-[#F06292] hover:bg-pink-50`;
  const btnActive = `${btnBase} bg-[#F06292] text-white border-[#F06292] shadow-pink-200`;

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col gap-3 pb-8">
      
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-[100] py-3 px-8 flex justify-between items-center shadow-sm border-b border-pink-50">
        <h1 className="text-3xl font-black text-[#D81B60] tracking-tighter">Miss Iong's Class</h1>
        
        <div className="flex gap-3 items-center">
          <div className="relative">
            <select 
              className="appearance-none bg-white text-[#F06292] font-black py-2 px-8 pr-12 rounded-full cursor-pointer focus:outline-none focus:ring-4 focus:ring-pink-100 shadow-sm border-2 border-pink-100 hover:border-[#F06292] hover:bg-pink-50 transition-all text-sm active:scale-95"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(c => <option key={c.id} value={c.id} className="text-slate-800">{c.className}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#F06292] font-black">▼</div>
          </div>
          
          <button onClick={handleExport} className={`${btnWhite} px-6 text-sm py-2`}>
            📩 EXPORT / 導出
          </button>
          
          <button onClick={handleImport} className={`${btnWhite} px-6 text-sm py-2`}>
            📩 IMPORT / 導入
          </button>
        </div>
      </header>

      <div className="mx-8 bg-white/80 backdrop-blur-sm rounded-full py-2 px-6 flex flex-wrap items-center justify-between gap-4 border border-white shadow-sm ring-4 ring-pink-50/50">
        <div className="flex gap-2 items-center">
          <button onClick={() => setSortType(SortType.ID_ASC)} className={sortType === SortType.ID_ASC ? btnActive : btnWhite}># ID / 學號</button>
          <button onClick={() => setSortType(SortType.SCORE_DESC)} className={sortType === SortType.SCORE_DESC ? btnActive : btnWhite}>HI-LO / 高到低</button>
          <button onClick={() => setSortType(SortType.SCORE_ASC)} className={sortType === SortType.SCORE_ASC ? btnActive : btnWhite}>LO-HI / 低到高</button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-pink-50/50 p-1 rounded-full border border-pink-100 mr-2">
             <button 
               onClick={() => { setIsMultiSelect(!isMultiSelect); setSelectedIds(new Set()); }}
               className={`${btnWhite} !border-none !shadow-none ${isMultiSelect ? '!bg-[#F06292] !text-white' : ''}`}
             >
               <span className={`w-3 h-3 rounded-full mr-1 ${isMultiSelect ? 'bg-white' : 'bg-slate-300'}`}></span>
               多選模式
             </button>
          </div>

          {isMultiSelect && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300 pr-3 border-r border-pink-100">
               <button onClick={() => setSelectedIds(new Set(students.map(s => s.id)))} className={`${btnWhite} bg-purple-50`}>全選</button>
               <button onClick={() => setSelectedIds(new Set())} className={btnWhite}>取消</button>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex items-center">
              <button 
                onClick={pickRandom} 
                disabled={isShuffling}
                className={`${btnWhite} !bg-orange-100 !border-orange-200 !text-orange-600 min-w-[120px]`}
              >
                隨機 ({pickedIdsMap[selectedClassId]?.length || 0}/{students.length})
              </button>
              <button 
                onClick={() => setPickedIdsMap(p => ({...p, [selectedClassId]: []}))}
                className="ml-1 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                title="Reset picker"
              >
                🔄
              </button>
            </div>
            
            <button 
              onClick={() => { if (selectedIds.size > 0) { setBulkActing(true); } }}
              disabled={selectedIds.size === 0}
              className={`${btnWhite} !bg-slate-100 !border-slate-200 !text-slate-500 disabled:opacity-50`}
            >
              獎懲評分 ({selectedIds.size})
            </button>

            <button className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-md border-b-2 border-yellow-600 hover:scale-110 active:scale-95 transition-all">
              🔔
            </button>
          </div>
        </div>
      </div>

      <main className="px-8 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredAndSortedStudents.map((student, idx) => (
            <div 
              key={student.id} 
              ref={el => studentRefs.current[idx] = el}
              className={`transition-all duration-300 ${isShuffling && shuffleIndex !== idx ? 'opacity-30 blur-[1px] scale-95' : ''} ${isShuffling && shuffleIndex === idx ? 'scale-110 z-20 ring-4 ring-yellow-400 rounded-[2.5rem]' : ''}`}
            >
              <StudentCard 
                student={student} 
                rank={sortType === SortType.SCORE_DESC ? idx + 1 : undefined}
                isSelected={selectedIds.has(student.id)}
                isMultiSelectMode={isMultiSelect}
                onClick={() => {
                  if (isMultiSelect) {
                    const newIds = new Set(selectedIds);
                    if (newIds.has(student.id)) newIds.delete(student.id);
                    else newIds.add(student.id);
                    setSelectedIds(newIds);
                  } else {
                    setActingStudent(student);
                  }
                }}
                onPokemonClick={(e) => {
                  e.stopPropagation();
                  if (!isMultiSelect) setPokeselStudent(student);
                }}
              />
            </div>
          ))}
        </div>
      </main>

      {(actingStudent || bulkActing) && (
        <ActionModal 
          student={actingStudent || { name: `${selectedIds.size}位所選學生`, rollNo: 0, pokemonId: 25 } as any}
          onClose={() => { setActingStudent(null); setBulkActing(false); }}
          onAction={(action) => {
            const ids = actingStudent ? [actingStudent.id] : Array.from(selectedIds);
            updateStudentPoints(ids, action.points, action.labelZh);
            setActingStudent(null);
            setBulkActing(false);
            if (bulkActing) { setIsMultiSelect(false); setSelectedIds(new Set()); }
          }}
          onManualPoint={(points) => {
            const ids = actingStudent ? [actingStudent.id] : Array.from(selectedIds);
            updateStudentPoints(ids, points, points > 0 ? '手動加分' : '手動減分');
            setActingStudent(null);
            setBulkActing(false);
            if (bulkActing) { setIsMultiSelect(false); setSelectedIds(new Set()); }
          }}
        />
      )}

      {pokeselStudent && (
        <PokemonSelector 
          student={pokeselStudent}
          currentId={pokeselStudent.pokemonId}
          onClose={() => setPokeselStudent(null)}
          onSelect={(newId) => {
            setClasses(prev => prev.map(c => ({
              ...c,
              students: c.students.map(s => s.id === pokeselStudent.id ? { ...s, pokemonId: newId } : s)
            })));
            setPokeselStudent(null);
          }}
        />
      )}

      {feedback && (
        <FeedbackOverlay 
          student={feedback.student} 
          type={feedback.type} 
          reason={feedback.reason}
          delta={feedback.delta}
          onComplete={() => setFeedback(null)} 
        />
      )}
    </div>
  );
};

export default App;
