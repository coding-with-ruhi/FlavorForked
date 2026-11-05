import 'dotenv/config'
import * as fs from 'fs'
import * as path from 'path'
import { connectToDatabase, closeDatabase } from '../src/server/db/client'
import * as knowledgeRepo from '../src/server/db/repos/knowledge'
import { createAllIndexes } from '../src/server/db/indexes'

async function loadJsonFile<T>(filePath: string): Promise<T> {
  const absolutePath = path.join(process.cwd(), filePath)
  const content = fs.readFileSync(absolutePath, 'utf-8')
  return JSON.parse(content)
}

async function seed() {
  try {
    console.log('🌱 Starting seed process...')

    // Connect to database
    console.log('📦 Connecting to MongoDB...')
    await connectToDatabase()

    // Create indexes
    console.log('📑 Creating indexes...')
    await createAllIndexes()

    // Load seed data
    console.log('📚 Loading seed data...')
    const ingredients = await loadJsonFile('seed-data/ingredient_knowledge.json')
    const synonyms = await loadJsonFile('seed-data/ingredient_synonyms.json')
    const nutrition = await loadJsonFile('seed-data/nutrition_data.json')
    const cuisines = await loadJsonFile('seed-data/cuisines.json')
    const recipes = await loadJsonFile('seed-data/recipes.json')

    // Insert ingredient knowledge
    console.log(`  - Inserting ${ingredients.length} ingredients...`)
    await knowledgeRepo.insertIngredientKnowledge(ingredients)

    // Insert ingredient synonyms
    console.log(`  - Inserting ${synonyms.length} synonyms...`)
    await knowledgeRepo.insertIngredientSynonyms(synonyms)

    // Insert nutrition data
    console.log(`  - Inserting ${nutrition.length} nutrition records...`)
    await knowledgeRepo.insertNutritionData(nutrition)

    // Insert cuisines
    console.log(`  - Inserting ${cuisines.length} cuisines...`)
    await knowledgeRepo.insertCuisineKnowledge(cuisines)

    // Insert recipes
    console.log(`  - Inserting ${recipes.length} recipe templates...`)
    await knowledgeRepo.insertRecipeKnowledge(recipes)

    console.log('✅ Seed completed successfully!')
    console.log(
      '\nSummary:'
    )
    console.log(`  📦 ${ingredients.length} ingredients loaded`)
    console.log(`  🔤 ${synonyms.length} synonyms loaded`)
    console.log(`  🍎 ${nutrition.length} nutrition records loaded`)
    console.log(`  🌍 ${cuisines.length} cuisines loaded`)
    console.log(`  📖 ${recipes.length} recipe templates loaded`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await closeDatabase()
  }
}

seed()
