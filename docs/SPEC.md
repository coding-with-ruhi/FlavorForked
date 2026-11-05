# FlavorForge — Product & Technical Spec (v1)

> Source of truth for building FlavorForge. If something here is ambiguous or conflicts with the existing code, ASK before deciding.

---

## 1. What we are building

FlavorForge is a full-stack AI cooking app. It turns **what's in your kitchen**, or **a food picture you found anywhere** (Pinterest, YouTube, Instagram), into a real recipe for a **meal, dessert, or drink**.

The user gets:
- 3–4 dish **options** to pick from
- a **full recipe** for the chosen option (name, exact measurements, steps, equipment, nutrition, flavor notes, missing items, AI-generated picture), **streamed live** as each part is ready
- **one-tap ingredient swaps** on any ingredient
- **versions** of every recipe (each tweak or swap = new version) with a side-by-side **diff**
- a step-by-step **cook mode** with timers that **updates the pantry** when finished

Positioning: "AI recipes you can iterate on like code." Not a recipe finder — a generator with memory (pantry) and history (versions).

---

## 2. Scope

### In scope (v1)
- Accounts (email/password + Google), onboarding (diet, staples)
- Persistent pantry
- Flow A: "What can I make?" (from pantry)
- Flow B: "Make this" (from an image: paste, drag-drop, or upload)
- Categories: `meal`, `dessert`, `drink` (non-alcoholic only)
- Diet styles: `veg`, `eggetarian`, `non_veg`
- Modes (max 4): use_only_my_ingredients, max_flavor, healthy, budget, restaurant, experimental
- Options step → full recipe pipeline with streaming
- Code-level constraint checker with regeneration
- Ingredient swaps (user-triggered) and free-text tweaks → versions
- Version tree + compare/diff view
- Cook mode with timers + pantry deduction (transactional)
- AI dish images in object storage, generated in background
- Public share links for a recipe version
- Rate limits / daily quotas per user
- Tests (unit, integration, e2e), AI evals, CI, deployment, error tracking, generation traces + admin page

### Out of scope (v1)
Alcoholic drinks, parsing YouTube/Pinterest links (screenshots only), meal planning, shopping lists, grocery prices, payments, native mobile apps, multi-language. Culinary chat (Brain 8) is a stretch goal after everything else is done.

---

## 3. Core user flows

### 3.1 Onboarding (first login)
User sets: diet style, default categories (optional), **staples** they always have (default: salt, water, cooking oil, sugar — editable). Staples count as available for "use only my ingredients".

### 3.2 Pantry
- Add items by typing; each item is normalized by Brain 2 to a `canonical_name` on save.
- Quantity is optional: `qty` + `unit`, or `qty: null` meaning "have some".
- Optional `expires_at`. Pantry page highlights items expiring within 3 days.

### 3.3 Flow A — "What can I make?"
1. User picks category (`meal` | `dessert` | `drink` | `any`), modes (≤4), optional "use expiring items first".
2. Server generates an **option set**: 3–4 options, each = name, one-line description, category, subcategory, est. time, pantry match % (computed in code, not by AI), missing items count.
3. User picks one → full recipe pipeline runs and streams (3.5).

### 3.4 Flow B — "Make this"
1. User pastes (Ctrl+V / long-press), drag-drops, or uploads an image (jpeg/png/webp, ≤5 MB, downscaled client-side to max 1600px).
2. Brain 3 (vision) returns: dish_name, category, subcategory, likely_ingredients, cuisine, technique, confidence. If not food or confidence below threshold → friendly error ("Couldn't recognize a dish — try a clearer picture").
3. User can edit detected ingredients, chooses diet/modes ("make it veg", "budget").
4. Option set is generated, e.g. faithful version / adapted to diet / pantry-only version. Each shows what's missing.
5. User picks one → full recipe pipeline (3.5).

### 3.5 Full recipe (streamed)
UI shows cards filling in as events arrive: normalized ingredients → recipe → checks → flavor, nutrition, substitutes, cookability → image (last, async). Recipe is saved as **v1** once the recipe + checks pass.

### 3.6 Swap an ingredient
On any recipe version: tap ingredient → "Swap" → Brain 6 returns 3–5 alternatives, each with confidence (0–1) and what changes (taste/texture/nutrition). Category-aware (baking swaps get honest, lower confidence). Picking one regenerates affected amounts/steps and saves a **new version** with `change.type = "swap"`.

### 3.7 Tweak with text
User types e.g. "make it less spicy", "no oven". Saves a **new version** with `change.type = "tweak"`.

### 3.8 Versions & compare
- Version tree page for a recipe family (`root_id`).
- Compare any two versions: ingredients added/removed/amount changed, steps changed, nutrition delta, flavor score delta. Diff is computed by a **pure function** on read, not stored.

### 3.9 Cook mode
- Full-screen, one step at a time, big tap targets, timers from step data (cook/bake/steep/brew), screen wake lock.
- On "Done": show a confirmation screen listing pantry items to deduct (editable). On confirm, a **MongoDB transaction** deducts quantities and creates a `cook_session`.
- Deduction rules: only items with known qty and compatible unit are reduced; items reaching 0 are removed; unit mismatch or `qty: null` → not reduced, just listed as "check this".

### 3.10 Share
User can make a version public → gets `/r/:shareId` readable without login. Making it private again disables the link.

---

## 4. Categories & diet rules

| Category | Rules |
|---|---|
| `meal` | Standard measurements; timers for cooking steps |
| `dessert` | **Grams** for dry ingredients; oven temp (°C) + pan size when baked; baked items with flour must include a leavening agent or an explicit note why not |
| `drink` | **ml** for liquids; serving info (glass, ice); brew/steep times; no alcohol |

| Diet | Forbidden ingredient tags |
|---|---|
| `veg` | meat, fish, seafood, egg, gelatin |
| `eggetarian` | meat, fish, seafood, gelatin |
| `non_veg` | none |

All categories: `alcohol` tag is always forbidden in v1.

Ingredient tags live in `ingredient_knowledge.diet_tags`. Unknown ingredients are classified by Gemini once, cached with `source: "ai"` and `needs_review: true`.

---

## 5. Architecture

```
Browser (React + TanStack Router + TanStack Query)
   │  server function calls / streamed events
   ▼
Server (TanStack Start server functions)
   ├─ auth + rate limit + Zod validation (every function)
   ├─ orchestrator → brains → constraint checker
   ├─ repos (all MongoDB access)
   └─ background jobs (image generation)
   │                    │                │
   ▼                    ▼                ▼
Gemini API        MongoDB Atlas     Object storage (Cloudinary or R2)
```

Rules:
- The browser NEVER talks to Gemini, MongoDB, or storage directly.
- All Mongo access goes through repo modules in `src/server/db/repos/`.
- Brains are typed functions: `(input: XInput) => Promise<XOutput>`, each with Zod schemas for input and output.

### 5.1 Brains

| Brain | Job |
|---|---|
| 1 Knowledge | Retrieve cuisine/recipe/technique context from knowledge collections |
| 2 Ingredient | Normalize to canonical names (synonyms table first, Gemini fallback), category + diet tags |
| 3 Vision | Image → dish, category, subcategory, ingredients, cuisine, technique, confidence |
| 4A Options | Generate 3–4 short options (cheap call) |
| 4 Recipe | Generate full recipe for chosen option / apply tweak or swap |
| 4B Image | Generate dish picture (background job) |
| 5 Flavor | Score salt, acid, fat, umami, aromatics, texture (0–10) + suggestions |
| 6 Substitution | Missing-item substitutes + user-triggered swaps (category-aware) |
| 6.5 Cookability | Score feasibility vs pantry (computed in code where possible) |
| 7 Nutrition | Per serving: calories, protein, fat, carbs, fiber, **sugar, caffeine** from `nutrition_data` + amount parser |
| 8 Chat | Stretch goal |

### 5.2 Pipeline (full recipe)
```
Brain 2 normalize → Brain 1 knowledge → Brain 4 recipe → CONSTRAINT CHECKER
   (on violation: re-run Brain 4 with violations listed, max 2 retries;
    if still failing, return recipe with warnings flagged in UI)
→ save v1 → parallel: Brain 5, 6, 6.5, 7 → enqueue Brain 4B image
```

### 5.3 Streaming events
Generation returns a stream of JSON events:
`normalized`, `recipe`, `check`, `saved` (includes recipe id), `flavor`, `nutrition`, `substitutions`, `cookability`, `image_pending`, `done`, `error`.
Each event: `{ type, data }`. The image arrives later via refetch/poll of the recipe (`image_status`: pending → ready | failed).
Verify the recommended streaming approach in current TanStack Start docs (streaming server function vs. server route) before implementing.

### 5.4 Constraint checker (plain TypeScript, no AI)
Checks a generated recipe against:
1. Output schema valid (Zod)
2. Diet rules (section 4) via diet_tags
3. use_only_my_ingredients: every ingredient is in pantry or staples (by canonical name)
4. No alcohol
5. Category rules (dessert grams/oven/leavening, drink ml/serving)
6. Every step with a duration has a timer value in seconds
Returns `{ ok, violations: [{ rule, detail }] }`. Fully unit-tested.

---

## 6. Data model (MongoDB)

Auth collections (user, session, account, verification) are managed by Better Auth's MongoDB adapter — verify current adapter setup in docs. App data:

```js
profiles {
  _id, user_id,                      // unique
  diet: "veg" | "eggetarian" | "non_veg",
  default_categories: ["meal","dessert","drink"],
  staples: ["salt","water","cooking oil","sugar"],
  role: "user" | "admin",
  created_at, updated_at
}

pantries {
  _id, user_id,                      // unique, one per user
  items: [{ canonical_name, display_name, qty: number|null, unit: string|null, expires_at: Date|null, added_at }],
  updated_at
}

option_sets {
  _id, user_id,
  source: { type: "pantry" | "image", image_analysis: {...} | null },
  input: { category, modes, diet, ingredients },
  options: [{ name, description, category, subcategory, est_minutes, pantry_match_pct, missing_count }],
  created_at                          // TTL 24h
}

recipes {
  _id, user_id,
  root_id,                            // = own _id for v1
  parent_id,                          // null for v1
  version,                            // 1, 2, 3...
  change: { type: "initial" | "tweak" | "swap", request: string|null, swap: { from, to }|null },
  category, subcategory, modes, diet,
  source: { type: "pantry" | "image", source_image_url: string|null },
  recipe_data: {
    name, description, cuisine, servings, total_minutes,
    ingredients: [{ canonical_name, display_name, amount, unit, optional: bool }],
    steps: [{ order, text, timer_seconds: number|null }],
    equipment: [], oven: { temp_c, mode }|null, serving: { glass, ice }|null,
    missing: [], tradeoffs: string|null
  },
  flavor: {...}, nutrition: { calories, protein_g, fat_g, carbs_g, fiber_g, sugar_g, caffeine_mg },
  substitutions: [...], cookability: {...},
  check: { ok, violations: [] },
  image_url: string|null, image_status: "pending" | "ready" | "failed",
  is_public: false, share_id: string|null,
  created_at
}

cook_sessions {
  _id, user_id, recipe_id, started_at, finished_at,
  deducted: [{ canonical_name, qty, unit }], skipped: [{ canonical_name, reason }]
}

generations {                         // traces
  _id, user_id, kind: "options" | "recipe" | "vision" | "swap" | "tweak" | "image",
  recipe_id: ObjectId|null,
  stages: [{ name, ms, ok, retries, input_tokens, output_tokens, error: string|null }],
  total_ms, created_at
}

usage {                               // daily quotas
  _id, user_id, date: "YYYY-MM-DD",
  options: 0, recipes: 0, vision: 0, swaps: 0, tweaks: 0
}

// knowledge (seeded from /seed-data/*.json via `npm run seed`)
ingredient_synonyms  { raw_term, canonical_name }
ingredient_knowledge { canonical_name, category, diet_tags: [], default_unit, grams_per_unit: { cup, tbsp, tsp, piece }, source: "seed"|"ai", needs_review }
cuisine_knowledge    { cuisine_name, techniques: [], flavor_profile: {} }
recipe_knowledge     { recipe_name, category, ingredients: [], techniques: [] }   // includes desserts + drinks
nutrition_data       { canonical_name, calories_per_100g, protein_per_100g, fat_per_100g, carbs_per_100g, fiber_per_100g, sugar_per_100g, caffeine_mg_per_100g }
```

### Indexes
- `profiles.user_id` unique; `pantries.user_id` unique
- `recipes { root_id: 1, version: 1 }` unique (prevents duplicate version numbers; on duplicate-key error, retry with next version)
- `recipes { user_id: 1, created_at: -1 }`
- `recipes.share_id` unique, sparse
- `option_sets.created_at` TTL 86400s
- `usage { user_id: 1, date: 1 }` unique
- `generations { created_at: -1 }`
- `ingredient_synonyms.raw_term` unique; `ingredient_knowledge.canonical_name` unique; `nutrition_data.canonical_name` unique

### Embed vs reference
Pantry items are embedded (always read together, one owner). Recipe versions reference parents (queried independently, unbounded growth).

---

## 7. Frontend routes

| Route | Purpose | Auth |
|---|---|---|
| `/` | Landing | public |
| `/login`, `/signup` | Auth | public |
| `/onboarding` | Diet, staples | user |
| `/pantry` | Manage pantry | user |
| `/create` | Flow A | user |
| `/create/photo` | Flow B | user |
| `/options/$optionSetId` | Pick an option | user |
| `/recipes` | My recipes (paginated) | user |
| `/recipes/$rootId` | Version tree | user |
| `/recipes/$rootId/v/$version` | One version (streams if generating) | user |
| `/recipes/$rootId/compare` | Diff (`?a=1&b=3`) | user |
| `/cook/$recipeId` | Cook mode | user |
| `/r/$shareId` | Public recipe | public |
| `/settings` | Profile, diet, staples, account | user |
| `/admin` | Traces dashboard | admin |

Every data view handles **loading, error (with retry), and empty** states. Mobile-first. Server state via TanStack Query. Forms via React Hook Form + shared Zod schemas.

---

## 8. Server functions (API)

Every function: session check → rate limit (if AI) → Zod input validation → ownership check → work → typed result or `{ code, message }` error.

- Profile: `getProfile`, `updateProfile`, `completeOnboarding`
- Pantry: `getPantry`, `addPantryItem`, `updatePantryItem`, `removePantryItem`
- Creation: `generateOptionsFromPantry`, `analyzeImage`, `generateOptionsFromImage`, `generateRecipe` (streams; input: optionSetId + optionIndex)
- Versions: `getRecipe`, `listRecipes`, `getVersionTree`, `compareVersions`, `getSwapOptions`, `applySwap` (streams), `applyTweak` (streams)
- Cook: `finishCooking` (transaction)
- Share: `setRecipePublic`, `getPublicRecipe`
- Admin: `getTraceStats`

Error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_FAILED`, `RATE_LIMITED`, `AI_FAILED`, `NOT_FOOD`, `INTERNAL`.

Default daily limits (in `src/shared/constants.ts`): options 30, recipes 20, vision 15, swaps 30, tweaks 30.

---

## 9. Security
- Secrets only in server env. Never prefix secrets with `VITE_`. Commit `.env.example`, never `.env`.
- Every user-data query filters by `user_id` from the session (never from client input).
- Zod enforces primitive types on all inputs (blocks NoSQL operator injection like `{ "$gt": "" }`).
- User free text (tweaks, edited ingredients) is length-limited (≤300 chars), clearly delimited as user data in prompts, and AI output must pass schema validation regardless.
- Uploads: type + size checked server-side.
- Gemini/model IDs and library APIs must be verified against current docs, not memory.

## 10. Storage
Dish images and saved source images go to object storage (Cloudinary or Cloudflare R2 — pick one in Phase 9 and note why). Mongo stores URLs only. Generated images are labeled "AI-generated preview" in the UI.

## 11. Testing
- **Unit (Vitest):** amount/unit parser, nutrition calc, constraint checker, version diff, pantry deduction logic, pantry match %.
- **Integration:** server functions against `mongodb-memory-server` (replica set mode for transactions), Gemini mocked.
- **E2E (Playwright):** sign up → onboarding → add pantry → options → recipe → swap → compare → cook → pantry updated.
- **AI evals (`/evals`):** 30–50 fixed inputs across all 3 categories and diets; script reports schema-valid %, constraint-violation %, retry rate, avg latency. Run on prompt changes.

## 12. DevOps
- Conventional commits, feature branches.
- GitHub Actions on push/PR: lint, typecheck, unit + integration tests.
- Deploy app to a host supported by TanStack Start (Vercel/Netlify/Railway — verify current support), MongoDB Atlas, object storage. Separate dev and prod databases.

## 13. Observability
- Sentry for frontend + server errors.
- Every AI call writes a `generations` trace. `/admin` shows: requests/day, avg latency per brain, failure rate, retry rate.

## 14. Environment variables
```
MONGODB_URI=
MONGODB_DB=
GEMINI_API_KEY=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STORAGE_PROVIDER=          # cloudinary | r2
STORAGE_*=                 # provider-specific keys
SENTRY_DSN=
VITE_SENTRY_DSN=           # public DSN only — safe to expose
```

## 15. Folder structure
```
src/
  routes/                 # TanStack Router file routes
  components/             # UI components (recipe/, pantry/, cook/, versions/, common/)
  server/
    functions/            # server functions grouped by domain
    pipeline/
      brains/             # brain-1 … brain-8
      orchestrator.ts
      checker/            # constraint checker (pure)
      events.ts           # stream event types
    db/
      client.ts           # Mongo connection (server only)
      repos/              # profiles, pantry, recipes, optionSets, cookSessions, generations, usage, knowledge
      indexes.ts
    lib/                  # gemini.ts, storage.ts, auth.ts, rateLimit.ts, errors.ts
  shared/                 # zod schemas, types, constants (safe for client + server)
seed-data/                # JSON for knowledge collections (meals, desserts, drinks)
scripts/                  # seed.ts, create-indexes.ts, run-evals.ts
tests/ unit/ integration/ e2e/
evals/                    # eval inputs + expectations
docs/                     # SPEC.md, ARCHITECTURE.md
```

---

## 16. Build phases

Work ONE phase at a time. Each phase ends with: summary, files changed (with plain-language explanation), how to test it manually, proposed commit message. Then STOP and wait for approval.

| # | Phase | Done when |
|---|---|---|
| 0 | Audit existing repo + plan | Written audit: what exists, what maps to spec, what changes, risks. No code changes except creating CLAUDE.md if missing |
| 1 | Foundation: Mongo client, repos, indexes, seed scripts + seed data (meals, desserts, drinks), remove Supabase, `.env.example` | `npm run seed` populates a fresh DB; app runs with no Supabase code left |
| 2 | Auth + profiles + onboarding + protected routes | Sign up/login/logout work; onboarding saves diet + staples; protected routes redirect |
| 3 | Pantry CRUD with normalization + expiry highlight | Items normalize on add; qty optional; all UI states handled |
| 4 | Flow A: options + full recipe pipeline + streaming | Cards fill in live; v1 saved; traces written |
| 5 | Constraint checker + diet/category rules + retries | Unit tests cover every rule; veg never gets meat/egg/gelatin; violations trigger regeneration |
| 6 | Flow B: image paste/drop/upload + vision + options | Screenshot → options → recipe works for a meal, a dessert, a drink |
| 7 | Versioning: swaps, tweaks, tree, compare | Swap and tweak create versions; diff shows ingredients, nutrition, flavor deltas |
| 8 | Cook mode + transactional pantry deduction | Timers + wake lock; confirm screen; deduction atomic; integration test proves rollback |
| 9 | Object storage + background image job + sharing | Images load from storage URL; pending/failed states; public link works and can be revoked |
| 10 | Rate limits + security hardening + UI polish | Quotas enforced with clear message; security checklist (section 9) verified |
| 11 | Tests + evals + CI | Unit/integration/e2e green in GitHub Actions; eval script prints report |
| 12 | Sentry + admin traces page + deployment + README + ARCHITECTURE.md | Live URL; README with screenshots, diagram, setup |
| 13 | (Stretch) Culinary chat | — |

---

## 17. Open decisions (ask the user when reached)
- Object storage provider (Phase 9)
- Hosting provider (Phase 12)
- Exact Gemini model IDs for text, vision, and image generation (verify current availability in Phase 1)
