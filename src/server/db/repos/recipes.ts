import { getDatabase } from '../client'
import { Recipe } from '@shared/types'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'recipes'

export async function getRecipeById(recipe_id: string): Promise<Recipe | null> {
  const db = getDatabase()
  return db
    .collection<Recipe>(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(recipe_id) })
}

export async function getRecipesByRootId(
  user_id: string,
  root_id: string
): Promise<Recipe[]> {
  const db = getDatabase()
  return db
    .collection<Recipe>(COLLECTION_NAME)
    .find({ user_id, root_id })
    .sort({ version: 1 })
    .toArray()
}

export async function listRecipesByUser(
  user_id: string,
  limit: number = 20,
  skip: number = 0
): Promise<Recipe[]> {
  const db = getDatabase()
  return db
    .collection<Recipe>(COLLECTION_NAME)
    .find({ user_id })
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip)
    .toArray()
}

export async function createRecipe(recipe: Omit<Recipe, '_id'>): Promise<Recipe> {
  const db = getDatabase()
  const result = await db.collection<Recipe>(COLLECTION_NAME).insertOne({
    ...recipe,
    created_at: new Date(),
  })

  return {
    ...recipe,
    _id: result.insertedId,
    created_at: new Date(),
  }
}

export async function updateRecipe(
  recipe_id: string,
  updates: Partial<Omit<Recipe, '_id' | 'created_at'>>
): Promise<Recipe | null> {
  const db = getDatabase()
  const result = await db
    .collection<Recipe>(COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(recipe_id) },
      { $set: updates },
      { returnDocument: 'after' }
    )

  return result.value || null
}

export async function getRecipeByShareId(share_id: string): Promise<Recipe | null> {
  const db = getDatabase()
  return db
    .collection<Recipe>(COLLECTION_NAME)
    .findOne({ share_id, is_public: true })
}

export async function getNextVersionNumber(
  user_id: string,
  root_id: string
): Promise<number> {
  const db = getDatabase()
  const recipes = await db
    .collection<Recipe>(COLLECTION_NAME)
    .find({ user_id, root_id })
    .sort({ version: -1 })
    .limit(1)
    .toArray()

  if (recipes.length === 0) {
    return 1
  }

  return recipes[0].version + 1
}
