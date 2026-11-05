import { getDatabase } from '../client'
import { CookSession } from '@shared/types'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'cook_sessions'

export async function createCookSession(
  session: Omit<CookSession, '_id'>
): Promise<CookSession> {
  const db = getDatabase()
  const result = await db
    .collection<CookSession>(COLLECTION_NAME)
    .insertOne(session)

  return { ...session, _id: result.insertedId }
}

export async function getCookSessionsByUser(
  user_id: string,
  limit: number = 20
): Promise<CookSession[]> {
  const db = getDatabase()
  return db
    .collection<CookSession>(COLLECTION_NAME)
    .find({ user_id })
    .sort({ started_at: -1 })
    .limit(limit)
    .toArray()
}
