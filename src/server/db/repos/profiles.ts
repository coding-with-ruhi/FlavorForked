import { getDatabase } from '../client'
import { Profile } from '@shared/types'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'profiles'

export async function getProfileByUserId(user_id: string): Promise<Profile | null> {
  const db = getDatabase()
  return db
    .collection<Profile>(COLLECTION_NAME)
    .findOne({ user_id })
}

export async function createProfile(
  user_id: string,
  data: Omit<Profile, '_id' | 'created_at' | 'updated_at'>
): Promise<Profile> {
  const db = getDatabase()
  const now = new Date()
  const profile: Profile = {
    ...data,
    user_id,
    created_at: now,
    updated_at: now,
  }

  const result = await db.collection<Profile>(COLLECTION_NAME).insertOne(profile)
  return { ...profile, _id: result.insertedId }
}

export async function updateProfile(
  user_id: string,
  updates: Partial<Omit<Profile, '_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Profile | null> {
  const db = getDatabase()
  const result = await db.collection<Profile>(COLLECTION_NAME).findOneAndUpdate(
    { user_id },
    {
      $set: {
        ...updates,
        updated_at: new Date(),
      },
    },
    { returnDocument: 'after' }
  )

  return result.value || null
}
