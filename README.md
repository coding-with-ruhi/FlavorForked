# FlavorForked

An AI cooking app that turns what's in your kitchen (or a food photo) into real recipes you can iterate on.

**Positioning:** "AI recipes you can iterate on like code."

## Phase 1: Foundation (In Progress)

### Setup

1. **Prerequisites**
   - Node.js 22+ installed
   - MongoDB Atlas account with a cluster and database
   - Google Gemini API key

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Then fill in your credentials in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB=flavorforked_dev
   GEMINI_API_KEY=your_key_here
   BETTER_AUTH_SECRET=generate_random_secret
   BETTER_AUTH_URL=http://localhost:3000
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Seed the Database**
   ```bash
   npm run seed
   ```

   This will:
   - Create all MongoDB indexes
   - Load ingredient knowledge (canonical names, nutrition data, synonyms)
   - Load recipe templates and cuisine knowledge

5. **Verify Setup**
   ```bash
   npm run dev
   ```

   App should run on `http://localhost:3000`

## Project Structure

```
src/
  server/
    db/
      client.ts           # MongoDB connection
      repos/              # CRUD modules
      indexes.ts          # Index creation
    lib/
      errors.ts           # Error types
      gemini.ts           # Gemini API client
  shared/
    constants.ts          # App constants (limits, defaults)
    types.ts             # TypeScript types
    schemas.ts           # Zod validation schemas
seed-data/
  ingredient_*.json       # Knowledge base seed data
scripts/
  seed.ts               # Populate database
  create-indexes.ts     # Create MongoDB indexes
```

## Concepts

- **MongoDB Repos:** All database queries go through modules in `src/server/db/repos/`. Never query inside components.
- **Zod Schemas:** All inputs/outputs validated with Zod.
- **Knowledge Base:** Ingredient synonyms, nutrition data, and recipes seeded from JSON.
- **Rate Limits:** Tracked per-user, per-day in the `usage` collection.

## Next: Phase 2

Auth + profiles + onboarding + protected routes.

---

Full spec: `docs/SPEC.md`  
Dev guide: `CLAUDE.md`
