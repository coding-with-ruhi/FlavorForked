import 'dotenv/config'
import { connectToDatabase, closeDatabase } from '../src/server/db/client'
import { createAllIndexes } from '../src/server/db/indexes'

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
