import { getDatabase } from './client'

export async function createAllIndexes(): Promise<void> {
  const db = getDatabase()

  // Profiles
  await db.collection('profiles').createIndex({ user_id: 1 }, { unique: true })

  // Pantries
  await db.collection('pantries').createIndex({ user_id: 1 }, { unique: true })

  // Recipes
  await db.collection('recipes').createIndex(
    { root_id: 1, version: 1 },
    { unique: true }
  )
  await db.collection('recipes').createIndex({ user_id: 1, created_at: -1 })
  await db.collection('recipes').createIndex(
    { share_id: 1 },
    { unique: true, sparse: true }
  )

  // Option Sets (TTL 24h)
  await db.collection('option_sets').createIndex(
    { created_at: 1 },
    { expireAfterSeconds: 86400 }
  )

  // Usage
  await db.collection('usage').createIndex(
    { user_id: 1, date: 1 },
    { unique: true }
  )

  // Generations
  await db.collection('generations').createIndex({ created_at: -1 })

  // Knowledge base
  await db.collection('ingredient_synonyms').createIndex(
    { raw_term: 1 },
    { unique: true }
  )
  await db.collection('ingredient_knowledge').createIndex(
    { canonical_name: 1 },
    { unique: true }
  )
  await db.collection('nutrition_data').createIndex(
    { canonical_name: 1 },
    { unique: true }
  )

  console.log('✅ All indexes created successfully')
}
