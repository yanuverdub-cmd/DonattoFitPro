
import React, { useState, useEffect } from 'react';
import { Tip, TipCategory } from '../types';
import { dbService } from '../services/dbService';
import { geminiService } from '../services/geminiService';
import { Sparkles, Loader2, Quote, Tag, Battery, Dumbbell, Coffee, Apple } from 'lucide-react';

export const TipsView: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTips(dbService.getTips());
  }, []);

  const handleGenerateTip = async () => {
    setLoading(true);
    // Rotate categories randomly for variety
    const categories: TipCategory[] = ['Nutrición', 'Fuerza', 'Hidratación', 'Suplementación', 'Motivación'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];
    
    const newTip = await geminiService.generateDailyTip(randomCat);
    dbService.addTip(newTip);
    setTips([newTip, ...tips]);
    setLoading(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'Nutrición': return <Apple size={14} />;
        case 'Fuerza': return <Dumbbell size={14} />;
        case 'Hidratación': return <Coffee size={14} />; // Using coffee as placeholder for drink
        case 'Suplementación': return <Battery size={14} />;
        default: return <Tag size={14} />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Consejos FitPro</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">Optimiza tu rendimiento con inteligencia artificial y la metodología Donatto.</p>
      </div>

      <div className="flex justify-center">
        <button 
            onClick={handleGenerateTip}
            disabled={loading}
            className="bg-black text-white px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-70"
        >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="text-yellow-400" />}
            GENERAR NUEVO CONSEJO
        </button>
      </div>

      <div className="space-y-4">
        {tips.map((tip) => (
            <div key={tip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:border-gray-300 transition-colors">
                <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-lg text-[10px] font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1">
                    {getCategoryIcon(tip.category)}
                    {tip.category}
                </div>
                
                <Quote className="text-gray-200 absolute top-4 left-4 transform -scale-x-100" size={40} />
                
                <div className="relative z-10 pt-6 pl-2">
                    <p className="text-lg font-bold text-gray-900 leading-relaxed">
                        {tip.content}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-4 uppercase font-medium">
                        {new Date(tip.dateAdded).toLocaleDateString()} • {tip.isAiGenerated ? 'IA Coach' : 'Donatto Team'}
                    </p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
