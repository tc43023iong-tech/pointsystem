
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

  const btnPillBase = "h-8 px-4 rounded-full font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-sm active:translate-y-0.5";
  const sortActive = "bg-pink-500 text-white";
  const sortInactive = "bg-pink-50 text-pink-400";
  
  return (
    <div className="min-h-screen bg-[#FDF2F5] p-6 flex flex-col gap-6">
      {/* Top Header Card */}
      <header className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-pink-100/50 max-w-[1600px] mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-4xl font-bold text-[#D81B60] tracking-tight">Miss Iong's Class</h1>
          <p className="text-pink-400 font-bold flex items-center gap-2 text-sm">
            ⭐ Point Management System / 學生積分系統 ⭐
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Class Selector Button */}
          <div className="relative group">
            <select 
              className="appearance-none bg-[#FFD600] text-white px-8 py-4 rounded-[2rem] font-bold text-lg min-w-[280px] cursor-pointer outline-none shadow-md group-hover:bg-[#FFC400] transition-colors pr-12"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="text-black font-sans">{c.className}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white font-black">
              ▼
            </div>
          </div>

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
            className="bg-[#64B5F6] hover:bg-[#42A5F5] text-white px-8 py-4 rounded-[2rem] font-bold text-lg flex items-center gap-3 shadow-md transition-all active:scale-95"
          >
            📥 EXPORT / 導出
          </button>

          <label className="bg-[#4DB6AC] hover:bg-[#26A69A] text-white px-8 py-4 rounded-[2rem] font-bold text-lg flex items-center gap-3 shadow-md cursor-pointer transition-all active:scale-95">
            📤 IMPORT / 導入
            <input type="file" className="hidden" accept=".txt" onChange={handleImport} />
          </label>
        </div>
      </header>

      {/* Control Bar Card */}
      <div className="bg-white rounded-[2rem] p-3 shadow-sm border border-pink-100/50 max-w-[1600px] mx-auto w-full flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSortType(SortType.ID_ASC)}
            className={`${btnPillBase} ${sortType === SortType.ID_ASC ? sortActive : sortInactive}`}
          >
            # ID / 學號
          </button>
          <button 
            onClick={() => setSortType(SortType.SCORE_DESC)}
            className={`${btnPillBase} ${sortType === SortType.SCORE_DESC ? sortActive : sortInactive}`}
          >
            HI-LO / 高到低
          </button>
          <button 
            onClick={() => setSortType(SortType.SCORE_ASC)}
            className={`${btnPillBase} ${sortType === SortType.SCORE_ASC ? sortActive : sortInactive}`}
          >
            LO-HI / 低到高
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={selectAllFiltered}
              className="h-8 px-4 rounded-full bg-[#B39DDB] text-white font-bold text-[11px] shadow-sm hover:bg-[#9575CD] transition-colors"
            >
              全選
            </button>
            <button 
              onClick={deselectAll}
              className="h-8 px-4 rounded-full bg-[#E1E2E6] text-gray-500 font-bold text-[11px] shadow-sm hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>

          <div className="flex items-center">
            <button 
              onClick={handleRandomPick}
              className="h-8 pl-4 pr-3 rounded-l-full bg-[#FF8A80] text-white font-bold text-[11px] flex items-center gap-2 shadow-sm hover:bg-[#FF5252] transition-colors"
            >
              隨機 ({pickedCount}/{filteredStudents.length})
            </button>
            <button 
              onClick={handleResetPicked}
              className="h-8 px-3 rounded-r-full bg-[#CFD8DC] text-gray-600 hover:bg-gray-400 transition-colors shadow-sm"
              title="Reset picked list"
            >
              🔄
            </button>
          </div>

          <button 
            onClick={() => {
              if (selectedIds.size > 0) setBulkActing(true);
            }}
            className={`h-9 px-6 rounded-full font-bold text-sm text-white transition-all shadow-md flex items-center gap-2 ${
              selectedIds.size > 0 
                ? 'bg-[#F06292] hover:bg-[#E91E63] scale-105' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            獎懲評分 ({selectedIds.size})
          </button>

          <button 
            onClick={() => setShowRules(true)}
            className="w-9 h-9 bg-[#FFD54F] hover:bg-[#FFC107] text-orange-900 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 text-lg"
          >
            🔔
          </button>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-24">
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
                  // If not in multi-select mode, we can auto-enter it on first click or just show action
                  // For this specific layout, let's toggle multi-select
                  setIsMultiSelect(true);
                  toggleSelection(student.id);
                }
              }}
              onPokemonClick={(e) => {
                e.stopPropagation();
                setPokeselStudent(student);
              }}
            />
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-300">
            <div className="text-8xl mb-4 opacity-10">🔍</div>
            <p className="text-2xl font-black uppercase tracking-widest opacity-30">No Students Found</p>
          </div>
        )}
      </main>

      {/* Overlays and Modals */}
      {isShuffling && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/98 backdrop-blur-xl">
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
            <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 overflow-hidden">
               {filteredStudents.map((s, idx) => (
                 <div 
                    key={s.id}
                    className={`aspect-[3/4] rounded-xl border-2 transition-all duration-75 flex items-center justify-center overflow-hidden ${
                      shuffleIndex === idx 
                        ? 'bg-yellow-400 border-white scale-110 z-20 shadow-[0_0_20px_white]' 
                        : shufflingWinner?.id === s.id
                          ? 'bg-pokemon-yellow border-white scale-125 z-30 shadow-[0_0_40px_rgba(255,255,255,0.8)]'
                          : 'bg-white/5 border-white/10 opacity-40'
                    }`}
                 >
                   {(shuffleIndex === idx || (shufflingWinner?.id === s.id)) && (
                     <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.pokemonId}.png`} 
                      className="w-full h-full object-contain p-1"
                     />
                   )}
                 </div>
               ))}
            </div>
            {shufflingWinner && (
              <div className="absolute inset-0 z-[130] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-in zoom-in duration-500">
                <div className="bg-white rounded-[3rem] p-8 border-8 border-pokemon-yellow transform rotate-3 shadow-2xl">
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shufflingWinner.pokemonId}.png`} className="w-64 h-64 mx-auto" />
                  <div className="text-center mt-6">
                    <p className="pokemon-font text-orange-900 text-3xl mb-2">#{shufflingWinner.rollNo}</p>
                    <p className="pokemon-font text-orange-900 text-2xl tracking-tighter">{shufflingWinner.name}</p>
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
