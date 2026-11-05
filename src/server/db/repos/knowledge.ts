import { getDatabase } from '../client'
import {
  IngredientKnowledge,
  IngredientSynonym,
  NutritionData,
  CuisineKnowledge,
  RecipeKnowledge,
} from '@shared/types'

export async function getIngredientBySynonym(raw_term: string): Promise<IngredientSynonym | null> {
  const db = getDatabase()
  return db
    .collection<IngredientSynonym>('ingredient_synonyms')
    .findOne({ raw_term: raw_term.toLowerCase() })
}

export async function getIngredientKnowledge(canonical_name: string): Promise<IngredientKnowledge | null> {
  const db = getDatabase()
  return db
    .collection<IngredientKnowledge>('ingredient_knowledge')
    .findOne({ canonical_name: canonical_name.toLowerCase() })
}

export async function getNutritionData(canonical_name: string): Promise<NutritionData | null> {
  const db = getDatabase()
  return db
    .collection<NutritionData>('nutrition_data')
    .findOne({ canonical_name: canonical_name.toLowerCase() })
}

export async function getCuisineKnowledge(cuisine_name: string): Promise<CuisineKnowledge | null> {
  const db = getDatabase()
  return db
    .collection<CuisineKnowledge>('cuisine_knowledge')
    .findOne({ cuisine_name: cuisine_name.toLowerCase() })
}

export async function getRecipeKnowledge(recipe_name: string): Promise<RecipeKnowledge | null> {
  const db = getDatabase()
  return db
    .collection<RecipeKnowledge>('recipe_knowledge')
    .findOne({ recipe_name: recipe_name.toLowerCase() })
}

// Bulk operations for seeding
export async function insertIngredientSynonyms(data: IngredientSynonym[]): Promise<void> {
  const db = getDatabase()
  if (data.length > 0) {
    await db
      .collection<IngredientSynonym>('ingredient_synonyms')
      .insertMany(data)
  }
}

export async function insertIngredientKnowledge(data: IngredientKnowledge[]): Promise<void> {
  const db = getDatabase()
  if (data.length > 0) {
    await db
      .collection<IngredientKnowledge>('ingredient_knowledge')
      .insertMany(data)
  }
}

export async function insertNutritionData(data: NutritionData[]): Promise<void> {
  const db = getDatabase()
  if (data.length > 0) {
    await db
      .collection<NutritionData>('nutrition_data')
      .insertMany(data)
  }
}

export async function insertCuisineKnowledge(data: CuisineKnowledge[]): Promise<void> {
  const db = getDatabase()
  if (data.length > 0) {
    await db
      .collection<CuisineKnowledge>('cuisine_knowledge')
      .insertMany(data)
  }
}

export async function insertRecipeKnowledge(data: RecipeKnowledge[]): Promise<void> {
  const db = getDatabase()
  if (data.length > 0) {
    await db
      .collection<RecipeKnowledge>('recipe_knowledge')
      .insertMany(data)
  }
}
