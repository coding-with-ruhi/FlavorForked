import { z } from 'zod'
import {
  CATEGORIES,
  DIET_STYLES,
  COOKING_MODES,
  DEFAULT_STAPLES,
} from './constants'

// Profile schemas
export const profileSchema = z.object({
  diet: z.enum(DIET_STYLES),
  default_categories: z.array(z.enum(CATEGORIES)).optional(),
  staples: z.array(z.string().min(1).max(100)),
})

// Pantry schemas
export const pantryItemSchema = z.object({
  canonical_name: z.string().min(1),
  display_name: z.string().min(1),
  qty: z.number().positive().nullable(),
  unit: z.string().max(50).nullable(),
  expires_at: z.date().nullable(),
})

export const addPantryItemSchema = z.object({
  display_name: z.string().min(1).max(100),
  qty: z.number().positive().nullable(),
  unit: z.string().max(50).nullable(),
  expires_at: z.date().nullable(),
})

// Recipe option schemas
export const recipeOptionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  category: z.enum(CATEGORIES),
  subcategory: z.string().min(1).max(100),
  est_minutes: z.number().int().positive(),
  pantry_match_pct: z.number().min(0).max(100),
  missing_count: z.number().int().nonnegative(),
})

// Recipe ingredient schemas
export const recipeIngredientSchema = z.object({
  canonical_name: z.string().min(1),
  display_name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
  optional: z.boolean(),
})

// Recipe step schemas
export const recipeStepSchema = z.object({
  order: z.number().int().positive(),
  text: z.string().min(1).max(500),
  timer_seconds: z.number().int().nonnegative().nullable(),
})

// Full recipe data schema
export const recipeDataSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  cuisine: z.string().min(1).max(100),
  servings: z.number().positive(),
  total_minutes: z.number().int().positive(),
  ingredients: z.array(recipeIngredientSchema),
  steps: z.array(recipeStepSchema),
  equipment: z.array(z.string()),
  oven: z
    .object({
      temp_c: z.number().positive(),
      mode: z.string().min(1),
    })
    .nullable(),
  serving: z
    .object({
      glass: z.string().min(1),
      ice: z.boolean(),
    })
    .nullable(),
  missing: z.array(z.string()),
  tradeoffs: z.string().max(500).nullable(),
})

// Generate options input
export const generateOptionsFromPantrySchema = z.object({
  category: z.enum(CATEGORIES),
  modes: z.array(z.enum(COOKING_MODES)).max(4),
  use_expiring_first: z.boolean().optional(),
})

// Generate recipe input
export const generateRecipeSchema = z.object({
  optionSetId: z.string().min(1),
  optionIndex: z.number().int().nonnegative(),
})

// Swap ingredient input
export const swapIngredientSchema = z.object({
  recipe_id: z.string().min(1),
  from_ingredient: z.string().min(1),
  to_ingredient: z.string().min(1),
})

// Tweak recipe input
export const tweakRecipeSchema = z.object({
  recipe_id: z.string().min(1),
  request: z.string().min(1).max(300),
})

// Vision input (image analysis)
export const visionAnalysisSchema = z.object({
  image_url: z.string().url(),
})

// Knowledge base schemas
export const ingredientKnowledgeSchema = z.object({
  canonical_name: z.string().min(1),
  category: z.string().min(1),
  diet_tags: z.array(z.string()),
  default_unit: z.string().min(1),
  grams_per_unit: z.record(z.string(), z.number()),
  source: z.enum(['seed', 'ai']),
  needs_review: z.boolean(),
})

export const nutritionDataSchema = z.object({
  canonical_name: z.string().min(1),
  calories_per_100g: z.number().nonnegative(),
  protein_per_100g: z.number().nonnegative(),
  fat_per_100g: z.number().nonnegative(),
  carbs_per_100g: z.number().nonnegative(),
  fiber_per_100g: z.number().nonnegative(),
  sugar_per_100g: z.number().nonnegative(),
  caffeine_mg_per_100g: z.number().nonnegative(),
})
