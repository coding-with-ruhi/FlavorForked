import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb
  }

  const mongoUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  if (!dbName) {
    throw new Error('MONGODB_DB is not defined in environment variables')
  }

  cachedClient = new MongoClient(mongoUri)
  await cachedClient.connect()
  cachedDb = cachedClient.db(dbName)

  return cachedDb
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}

export function getDatabase(): Db {
  if (!cachedDb) {
    throw new Error(
      'Database not connected. Call connectToDatabase() first.'
    )
  }
  return cachedDb
}
