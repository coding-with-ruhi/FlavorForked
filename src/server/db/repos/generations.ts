import { getDatabase } from '../client'
import { Generation } from '@shared/types'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'generations'

export async function createGeneration(
  generation: Omit<Generation, '_id'>
): Promise<Generation> {
  const db = getDatabase()
  const result = await db
    .collection<Generation>(COLLECTION_NAME)
    .insertOne(generation)

  return { ...generation, _id: result.insertedId }
}

export async function getGenerationsByUser(
  user_id: string,
  limit: number = 100,
  skip: number = 0
): Promise<Generation[]> {
  const db = getDatabase()
  return db
    .collection<Generation>(COLLECTION_NAME)
    .find({ user_id })
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip)
    .toArray()
}

export async function getGenerationsByKind(
  user_id: string,
  kind: string
): Promise<Generation[]> {
  const db = getDatabase()
  return db
    .collection<Generation>(COLLECTION_NAME)
    .find({ user_id, kind })
    .sort({ created_at: -1 })
    .toArray()
}
