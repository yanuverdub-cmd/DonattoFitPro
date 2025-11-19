
export enum ExerciseType {
  WEIGHT = 'WEIGHT',
  CARDIO = 'CARDIO'
}

export interface ExerciseLog {
  id: string;
  date: string;
  exerciseName: string;
  sets?: number;
  reps?: number;
  weight?: number;
  distanceKm?: number;
  durationMinutes?: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  type: ExerciseType;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  createdAt: number;
  profilePicture?: string;
  currentWeight?: string;
  mainObjective?: string;
  targetGoal?: string;
  activeDaysCount?: number;
  isAdmin?: boolean;
}

export type TipCategory = 'Nutrición' | 'Fuerza' | 'Hidratación' | 'Suplementación' | 'Motivación';

export interface Tip {
  id: string;
  content: string;
  category: TipCategory;
  isAiGenerated: boolean;
  dateAdded: number;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  type: 'water' | 'supplement' | 'habit';
  isDismissedToday: boolean;
  lastDismissedDate: string | null;
}

export type MealType = 'Desayuno' | 'Almuerzo' | 'Merienda' | 'Cena';

export interface Recipe {
  id: string;
  title: string;
  type: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string[];
  isAiGenerated: boolean;
  dateAdded: number;
}
