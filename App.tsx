
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
  const [feedback, setFeedback] = useState<{ student: Student, type: 'positive' | 'negative', reason?: string } | null>(null);
  
  // Multi-select State
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Random Picker State
  const [pickedIdsMap, setPickedIdsMap] = useState<Record<string, string[]>>({});
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleDisplay, setShuffleDisplay] = useState<Student | null>(null);

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
      setFeedback({ student, type: 'positive', reason });
      audioService.playPointUp();
    } else if (delta < 0) {
      setFeedback({ student, type: 'negative', reason });
      audioService.playPointDown();
    }
  };

  const handleAction = (action: PointAction) => {
    const isPos = action.type === 'positive';
    const pointsDelta = action.points;
    const reason = `${action.labelZh} / ${action.labelEn}`;

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
        name: `${selectedIds.size} Students / 多位同學`,
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
    const reason = "Manual / 手動調整";

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
        name: `${selectedIds.size} Students / 多位同學`,
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
    let count = 0;
    const maxShuffle = 18;
    const winnerIndex = Math.floor(Math.random() * pool.length);
    const winner = pool[winnerIndex];
    
    const interval = setInterval(() => {
      if (count < maxShuffle) {
        const randomIndex = Math.floor(Math.random() * filteredStudents.length);
        setShuffleDisplay(filteredStudents[randomIndex]);
        // Play tick sound with rising pitch for tension
        audioService.playShuffleTick(count, maxShuffle);
      } else {
        setShuffleDisplay(winner);
        audioService.playShuffleSuccess();
        clearInterval(interval);
        setTimeout(() => {
          setIsShuffling(false);
          setActingStudent(winner);
          setPickedIdsMap(prev => {
            const currentHistory = prev[selectedClassId] || [];
            if (!currentHistory.includes(winner.id)) {
              return { ...prev, [selectedClassId]: [...currentHistory, winner.id] };
            }
            return prev;
          });
        }, 500);
      }
      count++;
    }, 80);
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

  // Unified Button & Control Styles
  const headerControlBase = "h-10 px-4 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-tight flex items-center justify-center gap-2 transition-all shadow-md border-2 whitespace-nowrap";
  
  // Color themes
  const yellowBtnStyle = "bg-yellow-400 text-orange-900 border-yellow-300 hover:bg-yellow-300 active:translate-y-0.5";
  const orangeBtnStyle = "bg-orange-500 text-white border-orange-400 hover:bg-orange-400 active:translate-y-0.5 shadow-orange-900/10";
  
  const selectBase = "h-10 px-3 bg-white/10 border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer hover:bg-white/20 transition-colors shadow-sm outline-none";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified Header */}
      <header className="bg-pokemon-red text-white p-3 shadow-xl sticky top-0 z-40 border-b-4 border-black/10">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase tracking-tighter pokemon-font truncate max-w-[300px] lg:max-w-none">Miss Iong's Class</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Functional Buttons - Yellow */}
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
              {isMultiSelect ? '❌ CLOSE / 關閉多選' : '✅ MULTI-SELECT / 開啟多選'}
            </button>

            <button 
              onClick={handleRandomPick}
              className={`${headerControlBase} ${yellowBtnStyle}`}
            >
              🎯 RANDOM PICK ({pickedCount}/{filteredStudents.length})
            </button>

            {/* Settings Group */}
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

            {/* Data Buttons - Distinct Orange Warm Theme */}
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

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        {/* Secondary Toolbar for Multi-select Actions */}
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

      {/* Overlays */}
      {isShuffling && shuffleDisplay && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center p-8 rounded-3xl border-8 border-pokemon-yellow animate-in zoom-in">
            <h2 className="pokemon-font text-white text-3xl mb-12 animate-pulse">WHO'S NEXT?...</h2>
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shuffleDisplay.pokemonId}.png`} className="w-64 h-64 object-contain mx-auto relative z-10" />
            <p className="pokemon-font text-yellow-400 text-2xl mt-8">#{shuffleDisplay.rollNo} {shuffleDisplay.name}</p>
          </div>
        </div>
      )}

      {feedback && (
        <FeedbackOverlay 
          student={feedback.student} 
          type={feedback.type} 
          reason={feedback.reason}
          onComplete={() => setFeedback(null)} 
        />
      )}

      {(actingStudent || bulkActing) && !isShuffling && (
        <ActionModal 
          student={actingStudent || { name: `${selectedIds.size} Students / 多位同學`, rollNo: 0, pokemonId: 25 } as any} 
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
