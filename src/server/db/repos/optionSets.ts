import { getDatabase } from '../client'
import { OptionSet } from '@shared/types'
import { ObjectId } from 'mongodb'

const COLLECTION_NAME = 'option_sets'

export async function getOptionSetById(option_set_id: string): Promise<OptionSet | null> {
  const db = getDatabase()
  return db
    .collection<OptionSet>(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(option_set_id) })
}

export async function createOptionSet(optionSet: Omit<OptionSet, '_id'>): Promise<OptionSet> {
  const db = getDatabase()
  const result = await db
    .collection<OptionSet>(COLLECTION_NAME)
    .insertOne(optionSet)

  return { ...optionSet, _id: result.insertedId }
}
