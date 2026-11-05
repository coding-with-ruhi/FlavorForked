import { getDatabase } from '../client'
import { Usage } from '@shared/types'

const COLLECTION_NAME = 'usage'

function getTodayDateString(): string {
  const date = new Date()
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

export async function getUsageForToday(user_id: string): Promise<Usage> {
  const db = getDatabase()
  const date = getTodayDateString()

  let usage = await db
    .collection<Usage>(COLLECTION_NAME)
    .findOne({ user_id, date })

  if (!usage) {
    const newUsage: Usage = {
      user_id,
      date,
      options: 0,
      recipes: 0,
      vision: 0,
      swaps: 0,
      tweaks: 0,
    }
    const result = await db
      .collection<Usage>(COLLECTION_NAME)
      .insertOne(newUsage)
    usage = { ...newUsage, _id: result.insertedId }
  }

  return usage
}

export async function incrementUsage(
  user_id: string,
  field: keyof Omit<Usage, '_id' | 'user_id' | 'date'>,
  amount: number = 1
): Promise<Usage | null> {
  const db = getDatabase()
  const date = getTodayDateString()

  const updateObj: Record<string, number> = {}
  updateObj[field] = amount

  const result = await db
    .collection<Usage>(COLLECTION_NAME)
    .findOneAndUpdate(
      { user_id, date },
      { $inc: updateObj },
      { returnDocument: 'after', upsert: true }
    )

  return result.value || null
}
