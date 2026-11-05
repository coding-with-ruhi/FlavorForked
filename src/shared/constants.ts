// Rate limits per day per user
export const DAILY_LIMITS = {
  options: 30,
  recipes: 20,
  vision: 15,
  swaps: 30,
  tweaks: 30,
} as const

// Default staples
export const DEFAULT_STAPLES = ['salt', 'water', 'cooking oil', 'sugar'] as const

// Categories
export const CATEGORIES = ['meal', 'dessert', 'drink', 'any'] as const
export type Category = (typeof CATEGORIES)[number]

// Diet styles
export const DIET_STYLES = ['veg', 'eggetarian', 'non_veg'] as const
export type DietStyle = (typeof DIET_STYLES)[number]

// Cooking modes
export const COOKING_MODES = [
  'use_only_my_ingredients',
  'max_flavor',
  'healthy',
  'budget',
  'restaurant',
  'experimental',
] as const
export type CookingMode = (typeof COOKING_MODES)[number]

// Diet forbidden tags
export const DIET_FORBIDDEN_TAGS: Record<DietStyle, string[]> = {
  veg: ['meat', 'fish', 'seafood', 'egg', 'gelatin', 'alcohol'],
  eggetarian: ['meat', 'fish', 'seafood', 'gelatin', 'alcohol'],
  non_veg: ['alcohol'],
}

// Expiry warning (days)
export const EXPIRY_WARNING_DAYS = 3
