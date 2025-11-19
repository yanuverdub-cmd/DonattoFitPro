
import React, { useState, useEffect, useMemo } from 'react';
import { User, ExerciseLog, ExerciseType } from '../types';
import { dbService } from '../services/dbService';
import { Plus, Save, Activity, BarChart2, Calendar, Dumbbell, Timer, X, Play, Pause, RotateCcw, Share2, Trophy, Trash2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ProgressViewProps {
  user: User;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user }) => {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [formType, setFormType] = useState<ExerciseType>(ExerciseType.WEIGHT);
  
  // Form State
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');

  // 1RM State
  const [oneRepMax, setOneRepMax] = useState<number | null>(null);

  // Timer State
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [initialTimerValue, setInitialTimerValue] = useState(60);

  // Rest Prompt State
  const [showRestPrompt, setShowRestPrompt] = useState(false);

  useEffect(() => {
    const loadedLogs = dbService.getUserLogs(user.id);
    setLogs(loadedLogs);
  }, [user.id]);

  // Calculate 1RM automatically
  useEffect(() => {
    if (formType === ExerciseType.WEIGHT && weight && reps) {
        const w = parseFloat(weight);
        const r = parseFloat(reps);
        if (w > 0 && r > 0) {
            // Epley Formula: 1RM = Weight * (1 + Reps/30)
            const max = Math.round(w * (1 + r / 30));
            setOneRepMax(max);
        } else {
            setOneRepMax(null);
        }
    } else {
        setOneRepMax(null);
    }
  }, [weight, reps, formType]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      // Simple vibration feedback if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startTimer = (seconds: number) => {
    setInitialTimerValue(seconds);
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(initialTimerValue);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exerciseName,
      type: formType,
      rpe: rpe ? Number(rpe) : undefined,
      notes: notes,
      ...(formType === ExerciseType.WEIGHT && {
        weight: Number(weight),
        reps: Number(reps),
        sets: Number(sets) || 1 // Default to 1 set if empty
      }),
      ...(formType === ExerciseType.CARDIO && {
        distanceKm: Number(distance),
        durationMinutes: Number(duration)
      })
    };

    dbService.saveLog(user.id, newLog);
    setLogs([...logs, newLog]);
    
    // Suggest Timer for Weight training
    if (formType === ExerciseType.WEIGHT && !isTimerRunning) {
        setShowRestPrompt(true);
        // Auto hide after 6 seconds
        setTimeout(() => setShowRestPrompt(false), 6000);
    }

    // Reset Form
    setWeight('');
    setReps('');
    setSets('');
    setDistance('');
    setDuration('');
    setRpe('');
    setNotes('');
    setOneRepMax(null);
    // Keep exercise name for convenience
  };

  const uniqueExercises = useMemo(() => Array.from(new Set(logs.map(l => l.exerciseName))), [logs]);
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState<string>('');

  useEffect(() => {
    if (!selectedExerciseFilter && uniqueExercises.length > 0) {
      setSelectedExerciseFilter(uniqueExercises[0]);
    }
  }, [uniqueExercises, selectedExerciseFilter]);

  // Determine the type of the selected exercise to render the chart correctly
  const selectedExerciseType = useMemo(() => {
     const log = logs.find(l => l.exerciseName === selectedExerciseFilter);
     return log ? log.type : ExerciseType.WEIGHT;
  }, [logs, selectedExerciseFilter]);

  const chartData = useMemo(() => {
    if (!selectedExerciseFilter) return [];
    return logs
      .filter(l => l.exerciseName === selectedExerciseFilter)
      .map(l => ({
        date: new Date(l.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
        weight: l.weight || 0,
        distance: l.distanceKm || 0
      }));
  }, [logs, selectedExerciseFilter]);

  // Calculate Today's Stats
  const todaysLogs = useMemo(() => {
    const todayStr = new Date().toDateString();
    return logs.filter(l => new Date(l.date).toDateString() === todayStr);
  }, [logs]);

  const todayStats = useMemo(() => {
    let sets = 0;
    let volume = 0;
    let distance = 0;
    todaysLogs.forEach(l => {
        if (l.type === ExerciseType.WEIGHT) {
            sets += l.sets || 0;
            volume += (l.weight || 0) * (l.reps || 0) * (l.sets || 1);
        } else {
            distance += l.distanceKm || 0;
        }
    });
    return { sets, volume, distance };
  }, [todaysLogs]);

  const handleShareProgress = async () => {
    if (!selectedExerciseFilter) return;
    const filteredLogs = logs.filter(l => l.exerciseName === selectedExerciseFilter);
    if (filteredLogs.length === 0) return;
    
    // Find max record based on type
    const isWeight = selectedExerciseType === ExerciseType.WEIGHT;
    const maxVal = filteredLogs.reduce((max, log) => Math.max(max, (isWeight ? log.weight : log.distanceKm) || 0), 0);
    const lastLog = filteredLogs[filteredLogs.length - 1];
    const unit = isWeight ? 'kg' : 'km';
    
    const text = `📊 Progreso ${selectedExerciseFilter} en Donatto FitPro\n🏆 PR: ${maxVal}${unit}\n📅 Último: ${isWeight ? `${lastLog.weight}kg x ${lastLog.reps}reps` : `${lastLog.distanceKm}km`}`;

    if (navigator.share) {
        try {
            await navigator.share({ title: 'Mi Progreso', text: text });
        } catch (e) {}
    } else {
        navigator.clipboard.writeText(text);
        alert('Resumen copiado al portapapeles');
    }
  };

  const handleShareWorkout = async () => {
      const text = `🔥 Entrenamiento de Hoy en Donatto FitPro\n🏋️ Series: ${todayStats.sets}\n📦 Volumen: ${todayStats.volume.toLocaleString()}kg\n🏃 Cardio: ${todayStats.distance}km\n\n¡Sigue evolucionando!`;
      
      if (navigator.share) {
        try {
            await navigator.share({ title: 'Mi Entrenamiento', text: text });
        } catch (e) {}
      } else {
        navigator.clipboard.writeText(text);
        alert('Resumen copiado al portapapeles');
      }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">Progresos</h2>
        <button 
            onClick={() => { setShowTimer(true); setIsTimerRunning(false); setTimerSeconds(60); }}
            className="flex items-center gap-2 bg-gray-100 text-black px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
        >
            <Timer size={14} /> Cronómetro
        </button>
      </div>

      {/* Daily Summary Card (Only shows if logs exist today) */}
      {todaysLogs.length > 0 && (
          <div className="bg-black rounded-2xl p-6 text-white relative overflow-hidden shadow-lg animate-fade-in">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={100} />
             </div>
             <div className="relative z-10">
                <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Resumen de Hoy</h3>
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Series</p>
                        <p className="text-2xl font-black">{todayStats.sets}</p>
                    </div>
                    <div className="border-l border-gray-800">
                         <p className="text-xs text-gray-400 uppercase font-bold">Volumen</p>
                         <p className="text-2xl font-black">{Math.round(todayStats.volume / 1000)}k</p>
                    </div>
                    <div className="border-l border-gray-800">
                         <p className="text-xs text-gray-400 uppercase font-bold">Cardio</p>
                         <p className="text-2xl font-black">{todayStats.distance}km</p>
                    </div>
                </div>
                <button 
                    onClick={handleShareWorkout}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
                >
                    <Share2 size={14} /> Compartir Resumen
                </button>
             </div>
          </div>
      )}

      {/* Add Log Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${formType === ExerciseType.WEIGHT ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setFormType(ExerciseType.WEIGHT)}
          >
            <Dumbbell size={16} /> Pesas / Fuerza
          </button>
          <button
            className={`flex-1 py-3 rounded-lg text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${formType === ExerciseType.CARDIO ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            onClick={() => setFormType(ExerciseType.CARDIO)}
          >
            <Activity size={16} /> Cardio
          </button>
        </div>

        <form onSubmit={handleAddLog} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ejercicio</label>
            <input
              type="text"
              required
              list="exercises"
              className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-bold text-sm outline-none transition-colors"
              placeholder="Ej: Press Banca"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <datalist id="exercises">
              {uniqueExercises.map(ex => <option key={ex} value={ex} />)}
            </datalist>
          </div>

          {formType === ExerciseType.WEIGHT ? (
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      required
                      step="0.5"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-black text-lg outline-none transition-colors"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reps</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-black text-lg outline-none transition-colors"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Series</label>
                    <input
                      type="number"
                      placeholder="1"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-black text-lg outline-none transition-colors"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                    />
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Distancia (km)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-black text-lg outline-none transition-colors"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Minutos</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-black text-lg outline-none transition-colors"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                </div>
            </div>
          )}

          {/* 1RM Estimate Display */}
          {oneRepMax && (
             <div className="flex justify-end animate-fade-in">
                <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    1RM Estimado: {oneRepMax}kg
                </span>
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RPE (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-bold text-sm outline-none transition-colors"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notas</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 font-bold text-sm outline-none transition-colors"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={18} /> Registrar Serie
          </button>
        </form>
      </div>

      {/* Progress Chart */}
      {logs.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <BarChart2 size={18} /> Evolución
            </h3>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleShareProgress}
                    className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    title="Compartir Progreso"
                >
                    <Share2 size={14} />
                </button>
                <select
                  value={selectedExerciseFilter}
                  onChange={(e) => setSelectedExerciseFilter(e.target.value)}
                  className="text-xs font-bold bg-gray-100 border-none rounded-lg px-3 py-2 outline-none cursor-pointer"
                >
                  {uniqueExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fontWeight: 600}} 
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    tick={{fontSize: 10, fontWeight: 600}} 
                    tickLine={false}
                    axisLine={false}
                    width={30}
                />
                <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    itemStyle={{fontWeight: 'bold', fontSize: '12px'}}
                />
                <Area 
                    type="monotone" 
                    dataKey={selectedExerciseType === ExerciseType.WEIGHT ? "weight" : "distance"} 
                    stroke="#000000" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Calendar size={18} /> Historial Reciente
            </h3>
         </div>
         
         <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {logs.slice().reverse().map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-black">{log.exerciseName}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                            {new Date(log.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="text-xs font-medium text-gray-600">
                            {log.type === ExerciseType.WEIGHT ? (
                                <span>
                                    <span className="font-black text-lg text-black">{log.weight}kg</span> 
                                    <span className="mx-1">x</span> 
                                    {log.reps} reps
                                    {log.sets && log.sets > 1 && <span className="text-gray-400 ml-1">({log.sets} series)</span>}
                                </span>
                            ) : (
                                <span>
                                    <span className="font-black text-lg text-black">{log.distanceKm}km</span> 
                                    <span className="mx-1">en</span> 
                                    {log.durationMinutes} min
                                </span>
                            )}
                            {log.rpe && <span className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-bold">RPE {log.rpe}</span>}
                        </div>
                        {/* Delete option could be added here */}
                    </div>
                    {log.notes && (
                        <p className="text-[10px] text-gray-400 mt-1 italic">"{log.notes}"</p>
                    )}
                </div>
            ))}
            {logs.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">
                    No hay registros aún. ¡Empieza hoy!
                </div>
            )}
         </div>
      </div>

      {/* Rest Timer Modal */}
      {showTimer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
            <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative">
                <button 
                    onClick={() => setShowTimer(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                >
                    <X size={24} />
                </button>

                <h3 className="text-center text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Descanso</h3>
                
                <div className="text-center mb-8">
                    <div className="text-7xl font-black tabular-nums tracking-tighter">
                        {formatTime(timerSeconds)}
                    </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex justify-center gap-2 mb-8">
                    {[30, 60, 90, 120].map(sec => (
                        <button
                            key={sec}
                            onClick={() => startTimer(sec)}
                            className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold hover:bg-black hover:text-white transition-colors"
                        >
                            {sec}s
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={toggleTimer}
                        className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                    >
                        {isTimerRunning ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" className="ml-1" />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full bg-gray-100 text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Quick Rest Suggestion Toast */}
      {showRestPrompt && !showTimer && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-xl z-40 flex items-center gap-4 animate-slide-up w-[90%] max-w-sm justify-between">
              <span className="text-xs font-bold uppercase tracking-wide">¿Descanso?</span>
              <button 
                onClick={() => { setShowTimer(true); startTimer(90); setShowRestPrompt(false); }}
                className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-black uppercase hover:bg-gray-200 transition-colors"
              >
                Iniciar 90s
              </button>
              <button onClick={() => setShowRestPrompt(false)}>
                  <X size={14} className="text-gray-400" />
              </button>
          </div>
      )}

    </div>
  );
};
