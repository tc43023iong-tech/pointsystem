
import React, { useState, useEffect, useMemo } from 'react';
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
  const [showRules, setShowRules] = useState(false);
  
  // Multi-select State
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Random Picker State
  const [pickedIdsMap, setPickedIdsMap] = useState<Record<string, string[]>>({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState<number>(-1);
  const [shufflingWinner, setShufflingWinner] = useState<Student | null>(null);

  // Initialize data
  useEffect(() => {
    const saved = localStorage.getItem('miss_iong_class_data');
    const savedPicked = localStorage.getItem('miss_iong_picked_history');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClasses(parsed);
        if (parsed.length > 0) {
          setSelectedClassId(parsed[0].id);
        }
      } catch (e) {
        setClasses(INITIAL_CLASSES);
        setSelectedClassId(INITIAL_CLASSES[0].id);
      }
    } else {
      setClasses(INITIAL_CLASSES);
      setSelectedClassId(INITIAL_CLASSES[0].id);
    }

    if (savedPicked) {
      try {
        setPickedIdsMap(JSON.parse(savedPicked));
      } catch (e) {
        setPickedIdsMap({});
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem('miss_iong_class_data', JSON.stringify(classes));
    }
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('miss_iong_picked_history', JSON.stringify(pickedIdsMap));
  }, [pickedIdsMap]);

  const currentClass = useMemo(() => 
    classes.find(c => c.id === selectedClassId)
  , [classes, selectedClassId]);

  const filteredStudents = useMemo(() => {
    if (!currentClass) return [];
    
    let result = [...currentClass.students].filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.rollNo.toString().includes(searchQuery)
    );

    switch (sortType) {
      case SortType.ID_ASC:
        result.sort((a, b) => a.rollNo - b.rollNo);
        break;
      case SortType.SCORE_DESC:
        result.sort((a, b) => b.points - a.points);
        break;
      case SortType.SCORE_ASC:
        result.sort((a, b) => a.points - b.points);
        break;
      case SortType.NAME_ASC:
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh-HK'));
        break;
    }

    return result;
  }, [currentClass, searchQuery, sortType]);

  const updateStudent = (updatedStudent: Student) => {
    setClasses(prev => prev.map(c => {
      if (c.id === selectedClassId) {
        return {
          ...c,
          students: c.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        };
      }
      return c;
    }));
  };

  const updateMultipleStudents = (updatedStudents: Student[]) => {
    setClasses(prev => prev.map(c => {
      if (c.id === selectedClassId) {
        const studentMap = new Map(updatedStudents.map(s => [s.id, s]));
        return {
          ...c,
          students: c.students.map(s => studentMap.has(s.id) ? studentMap.get(s.id)! : s)
        };
      }
      return c;
    }));
  };

  const triggerFeedback = (student: Student, delta: number, reason?: string) => {
    if (delta > 0) {
      setFeedback({ student, type: 'positive', reason, delta });
      audioService.playPointUp();
    } else if (delta < 0) {
      setFeedback({ student, type: 'negative', reason, delta });
      audioService.playPointDown();
    }
  };

  const handleAction = (action: PointAction) => {
    const isPos = action.type === 'positive';
    const pointsDelta = action.points;
    const reason = action.labelZh;

    if (bulkActing) {
      const targetStudents = filteredStudents.filter(s => selectedIds.has(s.id));
      const updatedList = targetStudents.map(s => ({
        ...s,
        points: (s.points || 0) + pointsDelta,
        posPoints: (s.posPoints || 0) + (isPos ? Math.abs(pointsDelta) : 0),
        negPoints: (s.negPoints || 0) + (!isPos ? Math.abs(pointsDelta) : 0)
      }));
      updateMultipleStudents(updatedList);
      
      const groupStudent: Student = {
        id: 'group',
        name: `${selectedIds.size} 位同學`,
        rollNo: 0,
        pokemonId: 25,
        points: pointsDelta,
        posPoints: 0,
        negPoints: 0
      };
      
      triggerFeedback(groupStudent, pointsDelta, reason);
      
      setBulkActing(false);
      setIsMultiSelect(false);
      setSelectedIds(new Set());
    } else if (actingStudent) {
      const updated: Student = { 
        ...actingStudent, 
        points: (actingStudent.points || 0) + pointsDelta,
        posPoints: (actingStudent.posPoints || 0) + (isPos ? Math.abs(pointsDelta) : 0),
        negPoints: (actingStudent.negPoints || 0) + (!isPos ? Math.abs(pointsDelta) : 0)
      };
      updateStudent(updated);
      triggerFeedback(updated, pointsDelta, reason);
      setActingStudent(null);
    }
  };

  const handleManualPoint = (points: number) => {
    const isPos = points > 0;
    const isNeg = points < 0;
    const reason = "手動調整";

    if (bulkActing) {
      const targetStudents = filteredStudents.filter(s => selectedIds.has(s.id));
      const updatedList = targetStudents.map(s => ({
        ...s,
        points: (s.points || 0) + points,
        posPoints: (s.posPoints || 0) + (isPos ? Math.abs(points) : 0),
        negPoints: (s.negPoints || 0) + (isNeg ? Math.abs(points) : 0)
      }));
      updateMultipleStudents(updatedList);
      
      const groupStudent: Student = {
        id: 'group',
        name: `${selectedIds.size} 位同學`,
        rollNo: 0,
        pokemonId: 25,
        points: points,
        posPoints: 0,
        negPoints: 0
      };
      
      triggerFeedback(groupStudent, points, reason);

      setBulkActing(false);
      setIsMultiSelect(false);
      setSelectedIds(new Set());
    } else if (actingStudent) {
      const updated: Student = { 
        ...actingStudent, 
        points: (actingStudent.points || 0) + points,
        posPoints: (actingStudent.posPoints || 0) + (isPos ? Math.abs(points) : 0),
        negPoints: (actingStudent.negPoints || 0) + (isNeg ? Math.abs(points) : 0)
      };
      updateStudent(updated);
      triggerFeedback(updated, points, reason);
      setActingStudent(null);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set<string>();
    filteredStudents.forEach(s => next.add(s.id));
    setSelectedIds(next);
    setIsMultiSelect(true);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    setIsMultiSelect(false);
  };

  const handleRandomPick = () => {
    if (filteredStudents.length === 0) return;
    const classPickedHistory = pickedIdsMap[selectedClassId] || [];
    let pool = filteredStudents.filter(s => !classPickedHistory.includes(s.id));
    if (pool.length === 0) {
      pool = filteredStudents;
      setPickedIdsMap(prev => ({ ...prev, [selectedClassId]: [] }));
    }
    
    setIsShuffling(true);
    setShufflingWinner(null);
    let count = 0;
    const maxShuffle = 24;
    const winnerIndexInPool = Math.floor(Math.random() * pool.length);
    const winner = pool[winnerIndexInPool];
    
    const interval = setInterval(() => {
      if (count < maxShuffle) {
        const randomIndex = Math.floor(Math.random() * filteredStudents.length);
        setShuffleIndex(randomIndex);
        audioService.playShuffleTick(count, maxShuffle);
      } else {
        const finalIdx = filteredStudents.findIndex(s => s.id === winner.id);
        setShuffleIndex(finalIdx);
        setShufflingWinner(winner);
        audioService.playShuffleSuccess();
        clearInterval(interval);
        
        // Mark as picked in history
        setPickedIdsMap(prev => {
          const currentHistory = prev[selectedClassId] || [];
          if (!currentHistory.includes(winner.id)) {
            return { ...prev, [selectedClassId]: [...currentHistory, winner.id] };
          }
          return prev;
        });
      }
      count++;
    }, 100);
  };

  const handleResetPicked = () => {
    setPickedIdsMap(prev => ({ ...prev, [selectedClassId]: [] }));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData)) {
          setClasses(importedData);
          if (importedData.length > 0) {
            setSelectedClassId(importedData[0].id);
          }
          alert('Import Successful! / 導入成功！');
        } else {
          alert('Invalid file format. / 文件格式不正確。');
        }
      } catch (err) {
        console.error("Failed to import data:", err);
        alert('Error parsing file. / 解析文件時出錯。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const pickedCount = (pickedIdsMap[selectedClassId] || []).filter(id => filteredStudents.some(fs => fs.id === id)).length;

  const btnPillBase = "h-9 px-5 rounded-full font-bold text-[12px] flex items-center justify-center gap-2 transition-all shadow-sm active:translate-y-0.5";
  const sortActive = "bg-[#F06292] text-white shadow-md ring-2 ring-pink-100";
  const sortInactive = "bg-white text-pink-400 border border-pink-100 hover:bg-pink-50";

  // Current shuffling student display
  const shufflingStudent = shuffleIndex >= 0 ? filteredStudents[shuffleIndex] : null;
  
  return (
    <div className="min-h-screen bg-[#FDF2F5] p-6 flex flex-col gap-6">
      {/* Header - Modernized */}
      <header className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-pink-100/50 max-w-[1800px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-8 transition-all">
        <div className="flex flex-col items-start">
          <h1 className="text-5xl font-black text-[#D81B60] tracking-tighter leading-none mb-1">
            Miss Iong's Class
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <select 
              className="appearance-none bg-[#FFD600] hover:bg-[#FFC400] text-white px-10 py-4 rounded-[2rem] font-black text-xl min-w-[320px] cursor-pointer outline-none shadow-lg transition-all pr-14"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="text-black font-sans">{c.className}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white font-black text-xl">
              ▼
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                const data = JSON.stringify(classes, null, 2);
                const blob = new Blob([data], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Miss_Iongs_Data_${new Date().toISOString().split('T')[0]}.txt`;
                link.click();
              }}
              className="bg-[#64B5F6] hover:bg-[#42A5F5] text-white px-8 py-4 rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-md transition-all active:scale-95"
            >
              📥 EXPORT / 導出
            </button>

            <label className="bg-[#4DB6AC] hover:bg-[#26A69A] text-white px-8 py-4 rounded-[2rem] font-black text-lg flex items-center gap-3 shadow-md cursor-pointer transition-all active:scale-95">
              📤 IMPORT / 導入
              <input type="file" className="hidden" accept=".txt" onChange={handleImport} />
            </label>
          </div>
        </div>
      </header>

      {/* Control Bar - Cleaner and more professional */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2.2rem] p-4 px-6 shadow-sm border border-pink-100/30 max-w-[1800px] mx-auto w-full flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSortType(SortType.ID_ASC)} className={`${btnPillBase} ${sortType === SortType.ID_ASC ? sortActive : sortInactive}`}># ID / 學號</button>
          <button onClick={() => setSortType(SortType.SCORE_DESC)} className={`${btnPillBase} ${sortType === SortType.SCORE_DESC ? sortActive : sortInactive}`}>HI-LO / 高到低</button>
          <button onClick={() => setSortType(SortType.SCORE_ASC)} className={`${btnPillBase} ${sortType === SortType.SCORE_ASC ? sortActive : sortInactive}`}>LO-HI / 低到高</button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsMultiSelect(!isMultiSelect); if (isMultiSelect) setSelectedIds(new Set()); }}
            className={`h-9 px-5 rounded-full font-black text-[12px] shadow-sm transition-all flex items-center gap-2 ${isMultiSelect ? 'bg-[#D81B60] text-white ring-4 ring-pink-100 scale-105' : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-pink-200 hover:text-pink-400'}`}
          >
            <span className="text-lg leading-none">{isMultiSelect ? '☑️' : '🔘'}</span> 多選模式
          </button>

          <div className="h-6 w-px bg-slate-100 mx-1"></div>

          <div className="flex items-center gap-2">
            <button onClick={selectAllFiltered} className="h-9 px-5 rounded-full bg-[#B39DDB]/20 text-[#673AB7] hover:bg-[#B39DDB]/40 font-black text-[12px] transition-all">全選</button>
            <button onClick={deselectAll} className="h-9 px-5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-black text-[12px] transition-all">取消</button>
          </div>

          <div className="flex items-center bg-slate-50 rounded-full p-0.5 shadow-inner border border-slate-100">
            <button onClick={handleRandomPick} className="h-8 pl-5 pr-4 rounded-l-full bg-[#FFAB91] hover:bg-[#FF8A65] text-white font-black text-[11px] flex items-center gap-2 transition-all">
              隨機 ({pickedCount}/{filteredStudents.length})
            </button>
            <button onClick={handleResetPicked} className="h-8 px-3 rounded-r-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-all border-l border-white/30" title="Reset picked list">🔄</button>
          </div>

          <button 
            onClick={() => { if (selectedIds.size > 0) setBulkActing(true); }}
            className={`h-10 px-8 rounded-full font-black text-[13px] text-white transition-all shadow-lg flex items-center gap-3 ${selectedIds.size > 0 ? 'bg-[#F06292] hover:bg-[#E91E63] scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
          >
            獎懲評分 ({selectedIds.size})
          </button>

          <button onClick={() => setShowRules(true)} className="w-10 h-10 bg-[#FFD54F] hover:bg-[#FFC107] text-orange-900 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 text-xl">🔔</button>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-24">
          {filteredStudents.map((student, index) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              isSelected={selectedIds.has(student.id)}
              isMultiSelectMode={isMultiSelect}
              rank={sortType === SortType.SCORE_DESC ? index + 1 : undefined}
              onClick={() => {
                if (isMultiSelect) toggleSelection(student.id);
                else setActingStudent(student);
              }}
              onPokemonClick={(e) => { e.stopPropagation(); setPokeselStudent(student); }}
            />
          ))}
        </div>
      </main>

      {/* RANDOM PICK MODAL */}
      {isShuffling && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 border-[10px] border-[#F06292] shadow-2xl relative animate-in zoom-in duration-300 flex flex-col items-center">
            
            <div className="flex items-center gap-2 mb-8">
               <span className="text-2xl">🔍</span>
               <span className="text-[#F06292] font-black text-xl md:text-2xl tracking-tight uppercase">
                 SEARCHING... ({shuffleIndex + 1}/{filteredStudents.length})
               </span>
            </div>

            <div className="w-full aspect-[4/3] bg-[#FDF2F5] rounded-[2.5rem] flex items-center justify-center mb-10 overflow-hidden relative">
               {shufflingStudent && (
                 <img 
                    key={shufflingStudent.id}
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shufflingStudent.pokemonId}.png`} 
                    className={`w-40 h-40 object-contain drop-shadow-xl ${shufflingWinner ? 'scale-125' : 'animate-pulse'}`}
                    alt="Pokemon"
                 />
               )}
            </div>

            <div className="text-center mb-10 min-h-[4rem] flex flex-col justify-center">
              {shufflingStudent && (
                <h3 className="text-[#D81B60] text-3xl md:text-4xl font-black tracking-tight leading-tight">
                   #{shufflingStudent.rollNo} {shufflingStudent.name}
                </h3>
              )}
            </div>

            <div className="flex gap-4 w-full">
              <button 
                onClick={() => {
                  if (shufflingWinner) {
                    setActingStudent(shufflingWinner);
                    setIsShuffling(false);
                  }
                }}
                disabled={!shufflingWinner}
                className={`flex-1 py-4 rounded-3xl font-black text-xl transition-all shadow-lg active:scale-95 ${shufflingWinner ? 'bg-[#F06292] text-white hover:bg-[#E91E63]' : 'bg-pink-100 text-pink-300 cursor-not-allowed'}`}
              >
                評分
              </button>
              <button 
                onClick={() => setIsShuffling(false)}
                className="flex-1 py-4 rounded-3xl bg-[#F0F4F8] text-[#78909C] font-black text-xl hover:bg-[#E1E8EE] transition-all shadow-md active:scale-95"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
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

      {(actingStudent || bulkActing) && (
        <ActionModal 
          student={actingStudent || { name: `${selectedIds.size} 位同學`, rollNo: 0, pokemonId: 25 } as any} 
          onClose={() => { setActingStudent(null); setBulkActing(false); }} 
          onAction={handleAction}
          onManualPoint={handleManualPoint}
        />
      )}

      {pokeselStudent && (
        <PokemonSelector 
          currentId={pokeselStudent.pokemonId}
          student={pokeselStudent}
          onClose={() => setPokeselStudent(null)}
          onSelect={(newId) => {
            updateStudent({ ...pokeselStudent, pokemonId: newId });
            setPokeselStudent(null);
          }}
        />
      )}

      {showRules && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in">
            <div className="bg-[#FFD54F] p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-900 uppercase">Scoring Rules / 加分細則</h2>
              <button onClick={() => setShowRules(false)} className="text-orange-900 text-3xl">&times;</button>
            </div>
            <div className="p-8 space-y-4">
              <h3 className="text-lg font-bold text-orange-800 border-b-2 border-orange-100 pb-2">默書/測驗 加分</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { range: "100或以上", points: "+25" },
                  { range: "90～99", points: "+20" },
                  { range: "80～89", points: "+15" },
                  { range: "70～79", points: "+10" },
                  { range: "60～69", points: "+5" },
                ].map((rule, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <span className="font-bold text-gray-700">{rule.range}</span>
                    <span className="font-black text-orange-600 text-xl">{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
