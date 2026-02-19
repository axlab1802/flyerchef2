export enum CuisineType {
  JAPANESE = '和食',
  WESTERN = '洋食',
  CHINESE = '中華',
  OMOTENASHI = 'おもてなし',
  ELABORATE = '凝った料理',
  OTHER = 'その他'
}

export interface UserPreferences {
  budget: number;
  cuisine: CuisineType;
  customCuisine?: string;
  fridgeIngredients?: string[];
}

export interface Ingredient {
  name: string;
  quantity: string;
  isDiscounted: boolean;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTimeMinutes: number;
  ingredients: Ingredient[];
  instructions: string[];
  estimatedCost: number;
  savingsNote: string;
  nutrition?: Nutrition;
}

export interface AnalysisResult {
  isFlyer: boolean;
  joke?: string;
  recipes: Recipe[];
  detectedDeals: string[];
}

export interface SavedRecipe extends Recipe {
  savedAt: number;
  flyerDeals: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  isDiscounted: boolean;
  checked: boolean;
  recipeTitle: string;
}

// For Gemini Schema
export interface GeminiRecipeResponse {
  isFlyer: boolean;
  joke?: string;
  recipes?: {
    title: string;
    description: string;
    cookingTimeMinutes: number;
    ingredients: {
      name: string;
      quantity: string;
      isDiscounted: boolean;
    }[];
    instructions: string[];
    estimatedCost: number;
    savingsNote: string;
    nutrition?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber: number;
    };
  }[];
  detectedDeals?: string[];
}