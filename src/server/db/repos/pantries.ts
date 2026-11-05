import { getDatabase } from '../client'
import { Pantry, PantryItem } from '@shared/types'

const COLLECTION_NAME = 'pantries'

export async function getPantryByUserId(user_id: string): Promise<Pantry | null> {
  const db = getDatabase()
  return db
    .collection<Pantry>(COLLECTION_NAME)
    .findOne({ user_id })
}

export async function createPantry(user_id: string): Promise<Pantry> {
  const db = getDatabase()
  const pantry: Pantry = {
    user_id,
    items: [],
    updated_at: new Date(),
  }

  const result = await db.collection<Pantry>(COLLECTION_NAME).insertOne(pantry)
  return { ...pantry, _id: result.insertedId }
}

export async function addPantryItem(
  user_id: string,
  item: PantryItem
): Promise<Pantry | null> {
  const db = getDatabase()
  const result = await db.collection<Pantry>(COLLECTION_NAME).findOneAndUpdate(
    { user_id },
    {
      $push: { items: item },
      $set: { updated_at: new Date() },
    },
    { returnDocument: 'after' }
  )

  return result.value || null
}

export async function updatePantryItem(
  user_id: string,
  canonical_name: string,
  updates: Partial<PantryItem>
): Promise<Pantry | null> {
  const db = getDatabase()

  // Build update object for array element
  const updateSet: Record<string, unknown> = {}
  Object.entries(updates).forEach(([key, value]) => {
    updateSet[`items.$[elem].${key}`] = value
  })
  updateSet['updated_at'] = new Date()

  const result = await db.collection<Pantry>(COLLECTION_NAME).findOneAndUpdate(
    { user_id },
    { $set: updateSet },
    {
      arrayFilters: [{ 'elem.canonical_name': canonical_name }],
      returnDocument: 'after',
    }
  )

  return result.value || null
}

export async function removePantryItem(
  user_id: string,
  canonical_name: string
): Promise<Pantry | null> {
  const db = getDatabase()
  const result = await db.collection<Pantry>(COLLECTION_NAME).findOneAndUpdate(
    { user_id },
    {
      $pull: { items: { canonical_name } },
      $set: { updated_at: new Date() },
    },
    { returnDocument: 'after' }
  )

  return result.value || null
}
