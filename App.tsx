
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

  // Fireworks for shuffle
  const shuffleParticles = useMemo(() => {
    const count = 120;
    const colors = ['#FF3F3F', '#FFD700', '#00E5FF', '#FF00FF', '#7CFF01', '#FFFFFF', '#FFA500'];
    return Array.from({ length: count }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 500;
      return {
        id: i,
        dx: `${Math.cos(angle) * distance}px`,
        dy: `${Math.sin(angle) * distance}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: `${Math.random() * 2}s`,
        duration: `${0.6 + Math.random() * 0.8}s`,
        size: `${Math.random() * 10 + 4}px`
      };
    });
  }, []);

  // Initialize data
  useEffect(() => {
    const saved = localStorage.getItem('miss_iong_class_data');
    const savedPicked = localStorage.getItem('miss_iong_picked_history');
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClasses(parsed);
        setSelectedClassId(parsed[0]?.id || '');
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
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
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
        
        setTimeout(() => {
          setIsShuffling(false);
          setActingStudent(winner);
          setShuffleIndex(-1);
          setPickedIdsMap(prev => {
            const currentHistory = prev[selectedClassId] || [];
            if (!currentHistory.includes(winner.id)) {
              return { ...prev, [selectedClassId]: [...currentHistory, winner.id] };
            }
            return prev;
          });
        }, 1200);
      }
      count++;
    }, 80);
  };

  const handleResetPicked = () => {
    // History is cleared immediately to start a new round (as requested: "重新來一次")
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

  const headerControlBase = "h-10 px-4 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-tight flex items-center justify-center gap-2 transition-all shadow-md border-2 whitespace-nowrap";
  const yellowBtnStyle = "bg-yellow-400 text-orange-900 border-yellow-300 hover:bg-yellow-300 active:translate-y-0.5";
  const orangeBtnStyle = "bg-orange-500 text-white border-orange-400 hover:bg-orange-400 active:translate-y-0.5 shadow-orange-900/10";
  const selectBase = "h-10 px-3 bg-white/10 border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer hover:bg-white/20 transition-colors shadow-sm outline-none";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-pokemon-red text-white p-3 shadow-xl sticky top-0 z-40 border-b-4 border-black/10">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase tracking-tighter pokemon-font truncate max-w-[300px] lg:max-w-none">Miss Iong's Class</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* 🔔 Rules Button */}
            <button 
              onClick={() => setShowRules(true)}
              className="w-10 h-10 bg-yellow-400 text-orange-900 rounded-xl border-2 border-yellow-300 hover:bg-yellow-300 flex items-center justify-center shadow-md active:translate-y-0.5 transition-all text-lg"
              title="Scoring Rules / 加分細則"
            >
              🔔
            </button>

            <button 
              onClick={() => {
                setIsMultiSelect(!isMultiSelect);
                setSelectedIds(new Set());
              }}
              className={`${headerControlBase} ${
                isMultiSelect 
                  ? 'bg-yellow-500 text-orange-900 border-yellow-600 ring-2 ring-yellow-200 shadow-inner' 
                  : yellowBtnStyle
              }`}
            >
              {isMultiSelect ? '❌ CLOSE / 關閉多選' : 'MULTI-SELECT / 開啟多選'}
            </button>

            <div className="flex items-center gap-1">
              <button 
                onClick={handleRandomPick}
                className={`${headerControlBase} ${yellowBtnStyle}`}
              >
                RANDOM PICK ({pickedCount}/{filteredStudents.length})
              </button>
              <button 
                onClick={handleResetPicked}
                className="w-8 h-10 bg-yellow-500 text-orange-900 border-2 border-yellow-300 rounded-xl hover:bg-yellow-400 active:translate-y-0.5 transition-all shadow-md flex items-center justify-center text-sm"
                title="Start New Round / 重新來一次"
              >
                🔄
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select 
                className={selectBase}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id} className="text-black font-sans">{c.className}</option>
                ))}
              </select>
              
              <select 
                className={selectBase}
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
              >
                <option value={SortType.ID_ASC} className="text-black font-sans">Roll No / 學號排列</option>
                <option value={SortType.SCORE_DESC} className="text-black font-sans">Score (High-Low) / 分數由高到低</option>
                <option value={SortType.SCORE_ASC} className="text-black font-sans">Score (Low-High) / 分數由低到高</option>
                <option value={SortType.NAME_ASC} className="text-black font-sans">Name / 姓名排列</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const data = JSON.stringify(classes, null, 2);
                  const blob = new Blob([data], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `Miss_Iongs_All_Classes_Data_${new Date().toISOString().split('T')[0]}.txt`;
                  link.click();
                }} 
                className={`${headerControlBase} ${orangeBtnStyle}`}
              >
                EXPORT / 導出
              </button>
              
              <label className={`${headerControlBase} ${orangeBtnStyle} cursor-pointer`}>
                IMPORT / 導入
                <input type="file" className="hidden" accept=".txt" onChange={handleImport} />
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        {isMultiSelect && (
          <div className="mb-6 flex flex-wrap items-center gap-3 animate-in slide-in-from-top-4 duration-300">
            <button 
              onClick={selectAllFiltered}
              className="px-6 py-2.5 bg-yellow-400 text-orange-900 border-2 border-yellow-500 rounded-xl font-bold text-xs uppercase hover:bg-yellow-300 transition-colors shadow-sm"
            >
              SELECT ALL / 全選
            </button>
            <button 
              onClick={deselectAll}
              className="px-6 py-2.5 bg-yellow-100 text-orange-800 border-2 border-yellow-200 rounded-xl font-bold text-xs uppercase hover:bg-yellow-200 transition-colors shadow-sm"
            >
              NONE / 取消
            </button>
            <div className="px-4 py-2 text-orange-900 font-bold text-xs bg-yellow-50 rounded-lg border border-yellow-300 shadow-inner">
              {selectedIds.size} Selected / 已選擇
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 pb-24">
          {filteredStudents.map((student, index) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              isSelected={selectedIds.has(student.id)}
              isMultiSelectMode={isMultiSelect}
              rank={sortType === SortType.SCORE_DESC ? index + 1 : undefined}
              onClick={() => {
                if (isMultiSelect) {
                  toggleSelection(student.id);
                } else {
                  setActingStudent(student);
                }
              }}
              onPokemonClick={(e) => {
                e.stopPropagation();
                if (!isMultiSelect) setPokeselStudent(student);
              }}
            />
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="text-6xl mb-4 opacity-20">👻</div>
            <p className="text-xl font-black uppercase tracking-widest opacity-50">No Students Found</p>
          </div>
        )}
      </main>

      {/* Bulk Action Bar */}
      {isMultiSelect && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10">
          <button 
            onClick={() => setBulkActing(true)}
            className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-orange-900 font-black rounded-full shadow-[0_10px_40px_rgba(245,158,11,0.5)] border-b-8 border-yellow-700 hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-3"
          >
            ⭐ APPLY TO {selectedIds.size} SELECTED / 批量評分
          </button>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-yellow-400 p-6 flex justify-between items-center">
              <h2 className="text-xl font-black text-orange-900 uppercase">Scoring Rules / 加分細則</h2>
              <button onClick={() => setShowRules(false)} className="text-orange-900 text-3xl font-black">&times;</button>
            </div>
            <div className="p-8">
              <h3 className="text-lg font-black text-orange-800 mb-6 border-b-4 border-yellow-200 pb-2">默書/測驗 加分</h3>
              <div className="space-y-4">
                {[
                  { range: "100或以上", points: "+25" },
                  { range: "90～99", points: "+20" },
                  { range: "80～89", points: "+15" },
                  { range: "70～79", points: "+10" },
                  { range: "60～69", points: "+5" },
                ].map((rule, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-100">
                    <span className="font-bold text-gray-700 text-lg">{rule.range}</span>
                    <span className="font-black text-orange-600 text-2xl">{rule.points}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 p-4 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Classroom Excellence Program
            </div>
          </div>
        </div>
      )}

      {/* Random Pick Shuffle Overlay (Card Draw Style) */}
      {isShuffling && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/98 backdrop-blur-xl">
          {/* Continuous Fireworks Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-40">
            {shuffleParticles.map(p => (
              <div 
                key={p.id} 
                className="firework-particle firework-infinite" 
                style={{ 
                  '--dx': p.dx, 
                  '--dy': p.dy, 
                  '--duration': p.duration,
                  color: p.color,
                  backgroundColor: 'currentColor',
                  animationDelay: p.delay,
                  width: p.size,
                  height: p.size
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="w-full max-w-5xl h-full flex flex-col p-8 relative z-[120]">
            <h2 className="pokemon-font text-white text-2xl md:text-3xl mb-8 text-center animate-pulse tracking-tighter">
              {shufflingWinner ? 'WE HAVE A WINNER! / 抽中了！' : 'SHUFFLING THE DECK... / 正在洗牌...'}
            </h2>
            
            {/* Grid of "Cards" during shuffle */}
            <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 overflow-hidden">
               {filteredStudents.map((s, idx) => {
                 const isActive = shuffleIndex === idx;
                 const isWinner = shufflingWinner?.id === s.id;
                 return (
                   <div 
                    key={s.id}
                    className={`aspect-[3/4] rounded-xl border-2 transition-all duration-75 flex items-center justify-center overflow-hidden ${
                      isActive 
                        ? 'bg-yellow-400 border-white scale-110 z-20 shadow-[0_0_20px_white]' 
                        : isWinner && shufflingWinner 
                          ? 'bg-pokemon-yellow border-white scale-125 z-30 shadow-[0_0_40px_rgba(255,255,255,0.8)]'
                          : 'bg-white/5 border-white/10 opacity-40'
                    }`}
                   >
                     {(isActive || isWinner) && (
                       <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.pokemonId}.png`} 
                        className="w-full h-full object-contain p-1"
                       />
                     )}
                   </div>
                 );
               })}
            </div>

            {/* Winner Spotlight Reveal */}
            {shufflingWinner && (
              <div className="absolute inset-0 z-[130] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-in zoom-in duration-500">
                <div className="relative group">
                  <div className="absolute inset-0 bg-pokemon-yellow blur-[100px] rounded-full animate-pulse opacity-50"></div>
                  <div className="bg-white rounded-[3rem] p-8 border-8 border-pokemon-yellow shadow-[0_0_100px_rgba(255,235,59,0.5)] transform rotate-3 animate-in slide-in-from-bottom-20 duration-500">
                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shufflingWinner.pokemonId}.png`} className="w-64 h-64 object-contain mx-auto relative z-10" />
                    <div className="text-center mt-6">
                      <p className="pokemon-font text-orange-900 text-3xl mb-2">#{shufflingWinner.rollNo}</p>
                      <p className="pokemon-font text-orange-900 text-2xl tracking-tighter">{shufflingWinner.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

      {(actingStudent || bulkActing) && !isShuffling && (
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
          onClose={() => setPokeselStudent(null)}
          onSelect={(newId) => {
            updateStudent({ ...pokeselStudent, pokemonId: newId });
            setPokeselStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
