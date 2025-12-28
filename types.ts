
export enum ActivityLevel {
  MENTAL = 'Умственный труд',
  LIGHT = 'Легкий физический',
  ATHLETE = 'Спортсмен',
  HEAVY = 'Тяжелый физический'
}

export enum DietParameter {
  NONE = 'Без ограничений',
  DIABETES = 'Диабет',
  GLUTEN_FREE = 'Без глютена',
  LACTOSE_FREE = 'Без лактозы'
}

export type RationDuration = 1 | 7 | 30;
export type Language = 'ru' | 'en';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: 'male' | 'female';
  activityLevel: ActivityLevel;
  dietParameters: DietParameter[];
  duration?: RationDuration;
  avatarUrl?: string;
  language: Language;
}

export interface Ingredient {
  name: string;
  amount: string;
  imageUrl?: string;
}

export interface InstructionStep {
  stepNumber: number;
  text: string;
}

export interface AttachedDrink {
  id: string; // Added ID for compatibility
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  time: number; // Added time
  ingredients: Ingredient[]; // Added ingredients
  instructions: InstructionStep[]; // Added instructions
  imageSearchKeywords: string;
  imageUrl?: string;
  type: 'Drink'; // Mandatory type
}

export interface Meal {
  id: string;
  name: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Drink';
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  time: number;
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  imageUrl: string;
  imageSearchKeywords?: string;
  drink?: AttachedDrink;
}

export interface MealOption {
  meals: Meal[];
  totalKcal: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

export interface DailyRation {
  date: string;
  options: MealOption[];
  selectedOptionIndex?: number;
}
