
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
  const [pokeselStudent, setPokeselStudent] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<{ student: Student, type: 'positive' | 'negative', reason?: string } | null>(null);
  
  // Random Picker State - Maps classId to list of student IDs already picked
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
    if (!actingStudent) return;
    
    const isPos = action.type === 'positive';
    const pointsDelta = action.points;
    const reason = `${action.labelZh} / ${action.labelEn}`;
    
    const updated: Student = { 
      ...actingStudent, 
      points: (actingStudent.points || 0) + pointsDelta,
      posPoints: (actingStudent.posPoints || 0) + (isPos ? Math.abs(pointsDelta) : 0),
      negPoints: (actingStudent.negPoints || 0) + (!isPos ? Math.abs(pointsDelta) : 0)
    };

    updateStudent(updated);
    triggerFeedback(updated, pointsDelta, reason);
    setActingStudent(null);
  };

  const handleManualPoint = (points: number) => {
    if (!actingStudent) return;
    
    const isPos = points > 0;
    const isNeg = points < 0;
    const reason = "Manual / 手動調整";
    
    const updated: Student = { 
      ...actingStudent, 
      points: (actingStudent.points || 0) + points,
      posPoints: (actingStudent.posPoints || 0) + (isPos ? Math.abs(points) : 0),
      negPoints: (actingStudent.negPoints || 0) + (isNeg ? Math.abs(points) : 0)
    };

    updateStudent(updated);
    triggerFeedback(updated, points, reason);
    setActingStudent(null);
  };

  const handleRandomPick = () => {
    if (filteredStudents.length === 0) return;
    
    const classPickedHistory = pickedIdsMap[selectedClassId] || [];
    
    // Find students who haven't been picked yet
    let pool = filteredStudents.filter(s => !classPickedHistory.includes(s.id));
    
    // If everyone in the current filtered list has been picked, reset the pool
    if (pool.length === 0) {
      pool = filteredStudents;
      // We clear the history for this class to start fresh cycle
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
      } else {
        setShuffleDisplay(winner);
        clearInterval(interval);
        setTimeout(() => {
          setIsShuffling(false);
          setActingStudent(winner);
          // Mark as picked
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

  const exportData = () => {
    const data = JSON.stringify(classes, null, 2);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Miss_Iongs_All_Classes_Data_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setClasses(parsed);
          setSelectedClassId(parsed[0].id);
          alert('Import Successful! All class points and Pokemon restored.\n導入成功！所有班級分數與寶可夢已恢復。');
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        alert('Invalid file format. Please use a file exported by this app.\n檔案格式不正確。請使用此程式導出的檔案。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const pickedCount = (pickedIdsMap[selectedClassId] || []).filter(id => filteredStudents.some(fs => fs.id === id)).length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-pokemon-red text-white p-3 shadow-xl sticky top-0 z-40 border-b-4 border-black/10">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black uppercase tracking-tighter pokemon-font truncate max-w-[200px] lg:max-w-none">Miss Iong's Class</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleRandomPick}
              className="h-10 px-4 bg-yellow-400 text-red-700 font-black rounded-lg hover:bg-yellow-300 transition-all text-[11px] uppercase border-b-2 border-yellow-600 flex items-center gap-2 whitespace-nowrap shadow-md"
            >
              <span className="text-base">🎯</span> RANDOM PICK ({pickedCount}/{filteredStudents.length})
            </button>

            <select 
              className="h-10 px-3 bg-white/20 border border-white/30 rounded-lg text-xs font-bold focus:outline-none cursor-pointer hover:bg-white/30 transition-colors shadow-sm"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="text-black">{c.className}</option>
              ))}
            </select>
            
            <select 
              className="h-10 px-3 bg-white/20 border border-white/30 rounded-lg text-xs font-bold focus:outline-none cursor-pointer hover:bg-white/30 transition-colors shadow-sm"
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
            >
              <option value={SortType.ID_ASC} className="text-black">Roll No / 學號排列</option>
              <option value={SortType.SCORE_DESC} className="text-black">Score (High-Low) / 分數由高到低</option>
              <option value={SortType.SCORE_ASC} className="text-black">Score (Low-High) / 分數由低到高</option>
              <option value={SortType.NAME_ASC} className="text-black">Name / 姓名排列</option>
            </select>

            <button 
              onClick={exportData} 
              className="h-10 px-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-lg transition-all text-[11px] uppercase border-b-2 border-orange-700 shadow-md whitespace-nowrap"
            >
              EXPORT ALL / 導出全部
            </button>
            
            <label 
              className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-white font-black rounded-lg transition-all text-[11px] uppercase border-b-2 border-amber-700 shadow-md cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              IMPORT ALL / 導入全部
              <input type="file" className="hidden" accept=".txt" onChange={handleImport} />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full p-4">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400">
              🔍
            </div>
            <input 
              type="text" 
              placeholder="Search Student Name or Roll No..."
              className="w-full pl-12 pr-4 py-3 rounded-xl shadow-sm border-2 border-gray-100 focus:border-pokemon-blue focus:ring-4 focus:ring-blue-100 transition-all outline-none text-lg bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Students: {filteredStudents.length} / 總人數
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredStudents.map((student, index) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              rank={sortType === SortType.SCORE_DESC ? index + 1 : undefined}
              onClick={() => setActingStudent(student)}
              onPokemonClick={(e) => {
                e.stopPropagation();
                setPokeselStudent(student);
              }}
            />
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <div className="text-6xl mb-4 opacity-20">👻</div>
            <p className="text-xl font-black uppercase tracking-widest opacity-50">No Students Found / 找不到相關學生</p>
          </div>
        )}
      </main>

      {/* Random Pick Shuffling Modal */}
      {isShuffling && shuffleDisplay && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="text-center p-8 rounded-3xl border-8 border-pokemon-yellow animate-in zoom-in">
            <h2 className="pokemon-font text-white text-3xl mb-12 animate-pulse">WHO'S NEXT?...</h2>
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shuffleDisplay.pokemonId}.png`}
                className="w-64 h-64 object-contain mx-auto relative z-10 shuffle-item"
              />
            </div>
            <p className="pokemon-font text-yellow-400 text-2xl mt-8">#{shuffleDisplay.rollNo} {shuffleDisplay.name}</p>
          </div>
        </div>
      )}

      {/* Overlays */}
      {feedback && (
        <FeedbackOverlay 
          student={feedback.student} 
          type={feedback.type} 
          reason={feedback.reason}
          onComplete={() => setFeedback(null)} 
        />
      )}

      {actingStudent && !isShuffling && (
        <ActionModal 
          student={actingStudent} 
          onClose={() => setActingStudent(null)} 
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
