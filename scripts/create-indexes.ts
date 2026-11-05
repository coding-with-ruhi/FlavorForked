import { connectToDatabase, closeDatabase } from '../src/server/db/client.js'
import { createAllIndexes } from '../src/server/db/indexes.js'

async function main() {
  try {
    console.log('🔑 Creating database indexes...')
    await connectToDatabase()
    await createAllIndexes()
    console.log('✅ All indexes created!')
  } catch (error) {
    console.error('❌ Failed to create indexes:', error)
    process.exit(1)
  } finally {
    await closeDatabase()
  }
}

main()
