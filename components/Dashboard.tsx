
import React, { useState, useEffect } from 'react';
import { User, Reminder } from '../types';
import { Droplet, Plus, TrendingUp, Dumbbell, ChevronRight, Zap, ShoppingBag } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface DashboardProps {
  user: User;
  onChangeView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onChangeView }) => {
  const [quote, setQuote] = useState("Tu única competencia eres tú mismo.");
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Agua', message: 'Meta: 3 Litros hoy', type: 'water', isDismissedToday: false, lastDismissedDate: null },
    { id: '2', title: 'Creatina', message: '5g Post-Entreno', type: 'supplement', isDismissedToday: false, lastDismissedDate: null }
  ]);

  useEffect(() => {
    // Simulate AI Quote Fetch
    const fetchQuote = async () => {
        try {
            const tip = await geminiService.generateDailyTip('Motivación');
            setQuote(tip.content);
        } catch (e) {
            // Fallback
        }
    };
    fetchQuote();
  }, []);

  const dismissReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isDismissedToday: true } : r));
  };

  return (
    <div className="space-y-6">
      {/* Header Welcome */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-black tracking-tight uppercase">
          Hola, <span className="text-gray-500 capitalize">{user.firstName}.</span>
        </h1>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">
            Día {user.activeDaysCount || 1} • {user.mainObjective || 'Preparación General'}
        </p>
      </div>

      {/* Motivation Card */}
      <div className="bg-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <Dumbbell size={100} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Motivación Diaria</span>
            </div>
            <p className="text-xl md:text-2xl font-bold leading-tight italic">
                "{quote}"
            </p>
        </div>
      </div>

      {/* Quick Stats / Reminders */}
      <div className="grid grid-cols-2 gap-4">
        {reminders.map(reminder => (
            !reminder.isDismissedToday && (
                <div key={reminder.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col justify-between h-32 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-gray-50 opacity-50">
                        {reminder.type === 'water' ? <Droplet size={80} /> : <Plus size={80} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-black">{reminder.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{reminder.message}</p>
                    </div>
                    <button 
                        onClick={() => dismissReminder(reminder.id)}
                        className="z-10 mt-2 self-start bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-gray-800"
                    >
                        Completar
                    </button>
                </div>
            )
        ))}
      </div>

      {/* Main Action: Register Progress (High Contrast) */}
      <button 
        onClick={() => onChangeView('progress')}
        className="w-full group relative bg-black border-2 border-black rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98]"
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-white text-black p-3 rounded-full">
                    <TrendingUp size={24} />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Registrar Progreso</h3>
                    <p className="text-sm text-gray-400">Añade tu entrenamiento de hoy</p>
                </div>
            </div>
            <ChevronRight className="text-gray-500 group-hover:text-white transition-colors" />
         </div>
      </button>

      {/* Secondary Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
         <button 
            onClick={() => onChangeView('tips')}
            className="bg-gray-100 hover:bg-white border border-transparent hover:border-gray-200 p-4 rounded-xl transition-all text-left"
         >
            <Zap className="mb-3 text-black" size={24} />
            <h4 className="font-bold text-sm">Consejos IA</h4>
            <p className="text-[10px] text-gray-500 mt-1">Nutrición & Fuerza</p>
         </button>

         <button 
            onClick={() => onChangeView('merch')}
            className="bg-gray-100 hover:bg-white border border-transparent hover:border-gray-200 p-4 rounded-xl transition-all text-left"
         >
            <ShoppingBag className="mb-3 text-black" size={24} />
            <h4 className="font-bold text-sm">Tienda</h4>
            <p className="text-[10px] text-gray-500 mt-1">Equipamiento Pro</p>
         </button>
      </div>
    </div>
  );
};
