
import React, { useState, useEffect } from 'react';
import { Recipe, MealType } from '../types';
import { dbService } from '../services/dbService';
import { geminiService } from '../services/geminiService';
import { Utensils, Clock, Flame, ChevronDown, ChefHat, Sparkles, Loader2, Search, Dumbbell } from 'lucide-react';

export const NutritionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MealType>('Almuerzo');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [customRequest, setCustomRequest] = useState('');

  useEffect(() => {
    // Load recipes from DB
    const allRecipes = dbService.getRecipes();
    setRecipes(allRecipes);
  }, []);

  const filteredRecipes = recipes.filter(r => r.type === activeTab);

  const handleGenerateRecipe = async () => {
    setLoading(true);
    const newRecipe = await geminiService.generateRecipe(activeTab, customRequest);
    if (newRecipe) {
        dbService.addRecipe(newRecipe);
        setRecipes([newRecipe, ...recipes]);
        setExpandedRecipeId(newRecipe.id); // Auto expand new recipe
        setCustomRequest(''); // Clear input after generation
    }
    setLoading(false);
  };

  const tabs: MealType[] = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center mb-4">
         <h2 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center justify-center gap-2">
            <ChefHat /> Donatto Chef IA
         </h2>
         <p className="text-gray-500 text-sm">Recetas inteligentes ajustadas a tus macros.</p>
      </div>

      {/* Meal Filters */}
      <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* Custom Request Input */}
      <div className="relative">
        <Search className="absolute top-3.5 left-4 text-gray-400 w-5 h-5" />
        <input 
            type="text" 
            placeholder={`Ej: "Algo con pollo", "Sin harinas"...`}
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-3 pl-12 pr-4 font-bold text-sm focus:outline-none focus:border-black focus:ring-0 transition-colors placeholder-gray-300"
        />
      </div>

      {/* Generator Button */}
      <button 
        onClick={handleGenerateRecipe}
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? (
            <>
                <Loader2 className="animate-spin" /> Preparando Receta...
            </>
        ) : (
            <>
                <Sparkles className="text-yellow-400" /> Generar {activeTab}
            </>
        )}
      </button>

      {/* Recipe List */}
      <div className="space-y-4">
        {filteredRecipes.length === 0 && !loading && (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                <Utensils className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-gray-400 font-bold">No hay recetas guardadas para {activeTab}.</p>
                <p className="text-gray-400 text-xs">¡Prueba buscar algo específico!</p>
            </div>
        )}

        {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedRecipeId(expandedRecipeId === recipe.id ? null : recipe.id)}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded mb-2 inline-block">
                                {recipe.type}
                            </span>
                            <h3 className="text-lg font-black leading-tight">{recipe.title}</h3>
                        </div>
                        <ChevronDown 
                            className={`text-gray-400 transition-transform duration-300 ${expandedRecipeId === recipe.id ? 'rotate-180' : ''}`} 
                        />
                    </div>
                    
                    <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                            <Flame size={14} className="text-orange-500" />
                            {recipe.calories} kcal
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                            <Dumbbell size={14} className="text-black" />
                            {recipe.protein}g Prot
                        </div>
                    </div>
                </div>

                {expandedRecipeId === recipe.id && (
                    <div className="px-5 pb-5 pt-0 animate-slide-up">
                        <div className="border-t border-gray-100 pt-4 mt-2 space-y-4">
                            
                            {/* Ingredients */}
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-gray-400">Ingredientes</h4>
                                <ul className="space-y-1">
                                    {recipe.ingredients.map((ing, idx) => (
                                        <li key={idx} className="text-sm font-medium flex items-start gap-2">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0"></span>
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-wider mb-2 text-gray-400">Preparación</h4>
                                <ol className="space-y-3">
                                    {recipe.instructions.map((step, idx) => (
                                        <li key={idx} className="text-sm font-medium flex gap-3">
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <span className="text-gray-800">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Macros Detail */}
                            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400">Carbos</p>
                                    <p className="font-black text-sm">{recipe.carbs}g</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400">Grasas</p>
                                    <p className="font-black text-sm">{recipe.fats}g</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-400">Proteína</p>
                                    <p className="font-black text-sm">{recipe.protein}g</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};
