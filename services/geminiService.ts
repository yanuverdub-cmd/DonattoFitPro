import { GoogleGenAI, Type } from "@google/genai";
import { Tip, TipCategory, Recipe, MealType } from "../types";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize with API Key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  generateDailyTip: async (category?: TipCategory): Promise<Tip> => {
    const selectedCategory = category || 'Motivación';

    if (!process.env.API_KEY) {
        // Fallback if API key is missing
        return {
            id: generateId(),
            content: "La disciplina te llevará a lugares donde la motivación no puede llegar.",
            category: selectedCategory,
            isAiGenerated: false,
            dateAdded: Date.now()
        };
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Genera un consejo corto (max 25 palabras), impactante y útil sobre "${selectedCategory}" para un atleta de gimnasio.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tip: { type: Type.STRING }
                }
            }
        }
      });

      const text = response.text;
      const json = JSON.parse(text || '{"tip": "Sigue entrenando."}');
      
      return {
        id: generateId(),
        content: json.tip,
        category: selectedCategory,
        isAiGenerated: true,
        dateAdded: Date.now()
      };

    } catch (error) {
      console.error("Gemini Tip Error:", error);
      return {
        id: generateId(),
        content: "El descanso es clave para el crecimiento muscular.",
        category: selectedCategory,
        isAiGenerated: false,
        dateAdded: Date.now()
      };
    }
  },

  generateRecipe: async (mealType: MealType, customPreferences?: string): Promise<Recipe | null> => {
    if (!process.env.API_KEY) {
        console.error("API Key missing");
        return null;
    }

    try {
        let prompt = `Genera una receta saludable para: ${mealType}. Debe ser alta en proteínas y adecuada para fitness.`;
        if (customPreferences) {
            prompt += ` Preferencias del usuario: "${customPreferences}".`;
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fats: { type: Type.NUMBER },
                        ingredients: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        instructions: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from Gemini");
        
        const data = JSON.parse(text);

        return {
            id: generateId(),
            title: data.title || "Receta Fitness",
            type: mealType,
            calories: data.calories || 0,
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fats: data.fats || 0,
            ingredients: data.ingredients || [],
            instructions: data.instructions || [],
            isAiGenerated: true,
            dateAdded: Date.now()
        };

    } catch (error) {
        console.error("Gemini Recipe Error", error);
        return null;
    }
  }
};