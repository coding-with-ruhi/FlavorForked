import { Category, DietStyle, CookingMode } from './constants'
import { ObjectId } from 'mongodb'

// User & Profile
export interface Profile {
  _id?: ObjectId
  user_id: string
  diet: DietStyle
  default_categories: Category[]
  staples: string[]
  role: 'user' | 'admin'
  created_at: Date
  updated_at: Date
}

// Pantry
export interface PantryItem {
  canonical_name: string
  display_name: string
  qty: number | null
  unit: string | null
  expires_at: Date | null
  added_at: Date
}

export interface Pantry {
  _id?: ObjectId
  user_id: string
  items: PantryItem[]
  updated_at: Date
}

// Option Set
export interface RecipeOption {
  name: string
  description: string
  category: Category
  subcategory: string
  est_minutes: number
  pantry_match_pct: number
  missing_count: number
}

export interface OptionSet {
  _id?: ObjectId
  user_id: string
  source: {
    type: 'pantry' | 'image'
    image_analysis: null | Record<string, unknown>
  }
  input: {
    category: Category
    modes: CookingMode[]
    diet: DietStyle
    ingredients: string[]
  }
  options: RecipeOption[]
  created_at: Date
}

// Recipe
export interface RecipeIngredient {
  canonical_name: string
  display_name: string
  amount: number
  unit: string
  optional: boolean
}

export interface RecipeStep {
  order: number
  text: string
  timer_seconds: number | null
}

export interface RecipeData {
  name: string
  description: string
  cuisine: string
  servings: number
  total_minutes: number
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  equipment: string[]
  oven: { temp_c: number; mode: string } | null
  serving: { glass: string; ice: boolean } | null
  missing: string[]
  tradeoffs: string | null
}

export interface Recipe {
  _id?: ObjectId
  user_id: string
  root_id: string
  parent_id: string | null
  version: number
  change: {
    type: 'initial' | 'tweak' | 'swap'
    request: string | null
    swap: { from: string; to: string } | null
  }
  category: Category
  subcategory: string
  modes: CookingMode[]
  diet: DietStyle
  source: {
    type: 'pantry' | 'image'
    source_image_url: string | null
  }
  recipe_data: RecipeData
  flavor: Record<string, number>
  nutrition: {
    calories: number
    protein_g: number
    fat_g: number
    carbs_g: number
    fiber_g: number
    sugar_g: number
    caffeine_mg: number
  }
  substitutions: unknown[]
  cookability: Record<string, unknown>
  check: {
    ok: boolean
    violations: Array<{ rule: string; detail: string }>
  }
  image_url: string | null
  image_status: 'pending' | 'ready' | 'failed'
  is_public: boolean
  share_id: string | null
  created_at: Date
}

// Cook Session
export interface CookSession {
  _id?: ObjectId
  user_id: string
  recipe_id: string
  started_at: Date
  finished_at: Date | null
  deducted: Array<{ canonical_name: string; qty: number; unit: string }>
  skipped: Array<{ canonical_name: string; reason: string }>
}

// Generation Trace
export interface GenerationStage {
  name: string
  ms: number
  ok: boolean
  retries: number
  input_tokens: number
  output_tokens: number
  error: string | null
}

export interface Generation {
  _id?: ObjectId
  user_id: string
  kind: 'options' | 'recipe' | 'vision' | 'swap' | 'tweak' | 'image'
  recipe_id: ObjectId | null
  stages: GenerationStage[]
  total_ms: number
  created_at: Date
}

// Usage (daily quotas)
export interface Usage {
  _id?: ObjectId
  user_id: string
  date: string // YYYY-MM-DD
  options: number
  recipes: number
  vision: number
  swaps: number
  tweaks: number
}

// Knowledge Base
export interface IngredientKnowledge {
  canonical_name: string
  category: string
  diet_tags: string[]
  default_unit: string
  grams_per_unit: Record<string, number>
  source: 'seed' | 'ai'
  needs_review: boolean
}

export interface IngredientSynonym {
  raw_term: string
  canonical_name: string
}

export interface NutritionData {
  canonical_name: string
  calories_per_100g: number
  protein_per_100g: number
  fat_per_100g: number
  carbs_per_100g: number
  fiber_per_100g: number
  sugar_per_100g: number
  caffeine_mg_per_100g: number
}

export interface CuisineKnowledge {
  cuisine_name: string
  techniques: string[]
  flavor_profile: Record<string, number>
}

export interface RecipeKnowledge {
  recipe_name: string
  category: Category
  ingredients: string[]
  techniques: string[]
}

// API Error Response
export interface ApiError {
  code:
    | 'UNAUTHENTICATED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'VALIDATION_FAILED'
    | 'RATE_LIMITED'
    | 'AI_FAILED'
    | 'NOT_FOOD'
    | 'INTERNAL'
  message: string
}
