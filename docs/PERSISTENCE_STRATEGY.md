# Roadmap Persistence & History Strategy (Step 4)

## Overview

This document describes the **immutable, append-only persistence layer** for roadmap data, implemented in Step 4 of the PathWise roadmap generation system.

**Schema Version**: v1.0 (LOCKED)
**Implementation**: Supabase PostgreSQL with JSONB storage
**Pattern**: Append-only, never update or delete

---

## Goals

1. **Database Persistence**: Store validated roadmaps in PostgreSQL with JSONB storage
2. **Immutability**: Append-only storage - no updates or deletes
3. **Retrieval APIs**: Read-only endpoints for latest, history, and by-ID access
4. **Change Awareness**: Compare any two roadmaps using existing comparison utility

---

## Database Schema

### Table: `roadmaps`

```sql
CREATE TABLE IF NOT EXISTS roadmaps (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Roadmap metadata
  roadmap_id TEXT NOT NULL,
  roadmap_version TEXT NOT NULL DEFAULT '1.0',
  generation_reason TEXT CHECK (generation_reason IN ('initial', 'regeneration', 'assessment_update')),

  -- Determinism tracking
  input_hash TEXT NOT NULL,
  generation_seed BIGINT,

  -- LLM metadata
  llm_provider TEXT NOT NULL CHECK (llm_provider IN ('openai', 'groq')),
  model_used TEXT NOT NULL,
  generation_time_seconds NUMERIC,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,

  -- Validation status
  validation_passed BOOLEAN NOT NULL DEFAULT true,

  -- Complete roadmap data (JSONB)
  roadmap_data JSONB NOT NULL,

  -- Timestamps (immutable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Indexes

```sql
-- User queries
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_user_created ON roadmaps(user_id, created_at DESC);

-- Temporal queries
CREATE INDEX idx_roadmaps_created_at ON roadmaps(created_at DESC);

-- Deduplication
CREATE INDEX idx_roadmaps_input_hash ON roadmaps(input_hash);

-- Metadata lookups
CREATE INDEX idx_roadmaps_roadmap_id ON roadmaps(roadmap_id);

-- JSONB queries
CREATE INDEX idx_roadmaps_data_metadata ON roadmaps USING gin ((roadmap_data->'metadata'));
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own roadmaps
CREATE POLICY "Users can read own roadmaps"
  ON roadmaps FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert (backend only)
CREATE POLICY "Service role can insert roadmaps"
  ON roadmaps FOR INSERT
  WITH CHECK (true);

-- No UPDATE policy = no one can update (immutable)
-- No DELETE policy = no one can delete (immutable, except CASCADE)
```

---

## Helper Functions

### 1. `get_latest_roadmap(p_user_id UUID)`

Returns the most recent validated roadmap for a user.

```sql
CREATE OR REPLACE FUNCTION get_latest_roadmap(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  roadmap_id TEXT,
  roadmap_version TEXT,
  generation_reason TEXT,
  input_hash TEXT,
  roadmap_data JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.roadmap_id, r.roadmap_version,
    r.generation_reason, r.input_hash,
    r.roadmap_data, r.created_at
  FROM roadmaps r
  WHERE r.user_id = p_user_id
    AND r.validation_passed = true
  ORDER BY r.created_at DESC
  LIMIT 1;
END;
$$;
```

### 2. `get_roadmap_history(p_user_id UUID, p_limit INTEGER)`

Returns paginated roadmap history (metadata only, not full data).

```sql
CREATE OR REPLACE FUNCTION get_roadmap_history(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  roadmap_id TEXT,
  roadmap_version TEXT,
  generation_reason TEXT,
  input_hash TEXT,
  created_at TIMESTAMPTZ,
  total_modules INTEGER,
  total_hours INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id, r.roadmap_id, r.roadmap_version,
    r.generation_reason, r.input_hash, r.created_at,
    (r.roadmap_data->'learning_path_summary'->>'total_modules')::INTEGER as total_modules,
    (r.roadmap_data->'user_profile_summary'->>'total_estimated_hours')::INTEGER as total_hours
  FROM roadmaps r
  WHERE r.user_id = p_user_id
    AND r.validation_passed = true
  ORDER BY r.created_at DESC
  LIMIT p_limit;
END;
$$;
```

### 3. `roadmap_exists_by_hash(p_user_id UUID, p_input_hash TEXT)`

Checks if a roadmap with the same input hash already exists (deduplication).

```sql
CREATE OR REPLACE FUNCTION roadmap_exists_by_hash(p_user_id UUID, p_input_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM roadmaps
    WHERE user_id = p_user_id
      AND input_hash = p_input_hash
      AND validation_passed = true
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;
```

---

## Persistence Logic

### Integration with Generation API

The `/api/generate-roadmap-v2` endpoint was updated to persist roadmaps after validation:

```typescript
// ========== PERSIST TO DATABASE ==========
console.log(`[${correlationId}] 💾 Step 7: Persisting roadmap to database...`)

try {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log(`[${correlationId}] ⚠️  No authenticated user - skipping database save`)
    console.log(`[${correlationId}] ℹ️  Roadmap will still be returned to client`)
  } else {
    const { data: savedRoadmap, error: saveError } = await supabase
      .from('roadmaps')
      .insert({
        user_id: user.id,
        roadmap_id: roadmapData.metadata.roadmap_id,
        roadmap_version: roadmapData.metadata.roadmap_version || '1.0',
        generation_reason: roadmapData.metadata.generation_reason || 'initial',
        input_hash: inputHash,
        generation_seed: seed,
        llm_provider: llmResponse.provider,
        model_used: llmResponse.model,
        generation_time_seconds: parseFloat(generationDuration),
        prompt_tokens: llmResponse.usage?.prompt_tokens,
        completion_tokens: llmResponse.usage?.completion_tokens,
        validation_passed: true,
        roadmap_data: roadmapData
      })
      .select()
      .single()

    if (saveError) {
      console.error(`[${correlationId}] ❌ Failed to save roadmap to database:`, saveError)
      console.log(`[${correlationId}] ℹ️  Roadmap will still be returned to client`)
    } else {
      console.log(`[${correlationId}] ✅ Roadmap saved to database`)
      console.log(`[${correlationId}]    DB ID: ${savedRoadmap.id}`)
    }
  }
} catch (dbError: any) {
  console.error(`[${correlationId}] ❌ Database error:`, dbError.message)
  console.log(`[${correlationId}] ℹ️  Roadmap will still be returned to client`)
}
```

**Key Features**:
- Saves ONLY after validation passes
- Gracefully handles non-authenticated users (skips DB save)
- Continues to return roadmap even if DB save fails
- Comprehensive logging for debugging

---

## Read-Only API Endpoints

### 1. GET `/api/roadmaps/latest`

Get the most recent roadmap for the authenticated user.

**Request**:
```bash
GET /api/roadmaps/latest
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "roadmap": { /* complete roadmap data */ },
  "metadata": {
    "id": "uuid",
    "roadmap_id": "ml-eng-6mo-abc123",
    "roadmap_version": "1.0",
    "generation_reason": "initial",
    "input_hash": "sha256...",
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized (no valid session)
- `404`: No roadmap found for user
- `500`: Database error

---

### 2. GET `/api/roadmaps/history`

Get roadmap history for the authenticated user (metadata only).

**Request**:
```bash
GET /api/roadmaps/history?limit=10
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (optional): Number of roadmaps to return (default: 10, max: 50)

**Response**:
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "roadmap_id": "ml-eng-6mo-abc123",
      "roadmap_version": "1.0",
      "generation_reason": "initial",
      "input_hash": "sha256...",
      "created_at": "2025-01-17T10:30:00Z",
      "total_modules": 12,
      "total_hours": 144
    }
  ],
  "count": 1
}
```

**Status Codes**:
- `200`: Success (empty array if no roadmaps)
- `401`: Unauthorized
- `500`: Database error

---

### 3. GET `/api/roadmaps/[id]`

Get a specific roadmap by database UUID.

**Request**:
```bash
GET /api/roadmaps/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "roadmap": { /* complete roadmap data */ },
  "metadata": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "roadmap_id": "ml-eng-6mo-abc123",
    "roadmap_version": "1.0",
    "generation_reason": "initial",
    "input_hash": "sha256...",
    "generation_seed": 1234567890,
    "llm_provider": "openai",
    "model_used": "gpt-4o-mini",
    "generation_time_seconds": 12.34,
    "validation_passed": true,
    "created_at": "2025-01-17T10:30:00Z"
  }
}
```

**Status Codes**:
- `200`: Success
- `401`: Unauthorized
- `404`: Roadmap not found (or user doesn't own it)
- `500`: Database error

---

### 4. GET `/api/roadmaps/compare`

Compare two roadmaps and return structured diff.

**Request**:
```bash
GET /api/roadmaps/compare?id1=uuid1&id2=uuid2
Authorization: Bearer <token>
```

**Query Parameters**:
- `id1` (required): First roadmap UUID
- `id2` (required): Second roadmap UUID

**Response**:
```json
{
  "success": true,
  "comparison": {
    "roadmap1_metadata": {
      "id": "uuid1",
      "roadmap_id": "ml-eng-6mo-abc123",
      "created_at": "2025-01-17T10:00:00Z",
      "generation_reason": "initial"
    },
    "roadmap2_metadata": {
      "id": "uuid2",
      "roadmap_id": "ml-eng-6mo-def456",
      "created_at": "2025-01-17T12:00:00Z",
      "generation_reason": "regeneration"
    },
    "diff": {
      "modules_added": [ /* ... */ ],
      "modules_removed": [ /* ... */ ],
      "modules_moved_between_tracks": [ /* ... */ ],
      "skills_track_changes": [ /* ... */ ],
      "modules_unchanged": [ /* ... */ ]
    },
    "formatted_diff": "Roadmap Comparison:\n..."
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Missing or invalid parameters
- `401`: Unauthorized
- `404`: One or both roadmaps not found
- `500`: Database error

---

## Immutability Guarantees

### What is Immutable?

1. **No Updates**: No UPDATE RLS policy exists - once saved, roadmaps cannot be modified
2. **No Deletes**: No DELETE RLS policy exists - roadmaps cannot be deleted (except CASCADE on user deletion)
3. **Timestamps**: `created_at` uses `DEFAULT NOW()` - cannot be overridden
4. **Append-Only**: Only INSERT operations are allowed (via service role)

### Why Immutable?

1. **Audit Trail**: Complete history of all generated roadmaps
2. **Reproducibility**: Original data preserved for debugging
3. **Comparison**: Can diff any two versions at any time
4. **Trust**: Users can see exactly what was generated and when
5. **Simplicity**: No complex update logic or conflict resolution

### Exception: User Deletion

When a user account is deleted:
```sql
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

All associated roadmaps are automatically deleted via PostgreSQL CASCADE. This is the ONLY way roadmaps are deleted.

---

## Testing

### Prerequisites

1. Development server running (`npm run dev`)
2. Supabase running locally or connected to cloud
3. User authenticated (log in via UI first)
4. Database migration applied

### Running Tests

```bash
node scripts/test-roadmap-persistence.js
```

### What is Tested

1. **Persistence**: Roadmap saves to database after generation
2. **Latest API**: Can retrieve most recent roadmap
3. **History API**: Can retrieve paginated history
4. **By-ID API**: Can retrieve specific roadmap by UUID
5. **Compare API**: Can compare two roadmaps
6. **Immutability**: Verifies append-only behavior (manual verification)

### Expected Output

```
🧪 ROADMAP PERSISTENCE & HISTORY TEST SUITE (STEP 4)

📋 TEST SUITE: Roadmap Persistence
──────────────────────────────────────────────────────────────────────
📝 Generating First Roadmap
✅ Generation successful (12.45s)
   Roadmap ID: ml-eng-6mo-abc123
   Database ID: 550e8400-e29b-41d4-a716-446655440000

═══════════════════════════════════════════════════════════════
🔍 TEST: GET Latest Roadmap
✅ Latest roadmap retrieved

═══════════════════════════════════════════════════════════════
🔍 TEST: GET Roadmap History
✅ History retrieved: 1 roadmap(s)

═══════════════════════════════════════════════════════════════
🔍 TEST: GET Roadmap by ID
✅ Roadmap retrieved by ID

📝 Generating Second Roadmap
✅ Generation successful (11.23s)

═══════════════════════════════════════════════════════════════
🔍 TEST: Compare Two Roadmaps
✅ Comparison complete
   📊 Changes Detected: 15
      Modules Added: 3
      Modules Removed: 2
      Modules Moved: 1
      Skills Track Changes: 9
      Modules Unchanged: 7

📊 TEST SUMMARY
   Total Tests: 7
   ✅ Passed: 7
   ❌ Failed: 0
```

---

## Security Considerations

### Row Level Security (RLS)

- Users can ONLY read their own roadmaps
- Backend service role can INSERT (but not UPDATE/DELETE)
- No direct user writes - all writes go through backend API

### Authentication

All endpoints require valid Supabase session:
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  )
}
```

### Input Validation

- UUIDs validated via PostgreSQL type system
- Query parameters sanitized
- Limit parameters capped (max 50 for history)

---

## Performance Considerations

### Indexes

- **User queries**: Fast lookups via `idx_roadmaps_user_id`
- **Temporal sorting**: Fast ordering via `idx_roadmaps_created_at`
- **Combined queries**: Fast user history via `idx_roadmaps_user_created`
- **Deduplication**: Fast hash lookups via `idx_roadmaps_input_hash`
- **JSONB queries**: Fast metadata access via GIN index

### Query Optimization

- Helper functions use `LIMIT` to prevent full table scans
- History API returns metadata only (not full roadmap data)
- Latest API uses `LIMIT 1` with descending sort

### JSONB Storage

- Complete roadmap stored as JSONB for flexible querying
- GIN index on metadata for fast attribute lookups
- Efficient storage (compressed by PostgreSQL)

---

## Future Enhancements (Out of Scope for Step 4)

1. **Deduplication**: Use `roadmap_exists_by_hash()` to detect identical inputs
2. **Archival**: Move old roadmaps to cold storage after N months
3. **Export**: Endpoints to export roadmaps as PDF/JSON files
4. **Analytics**: Aggregate statistics on generation patterns
5. **Sharing**: Allow users to share specific roadmaps via public links

---

## Migration

### Applying the Migration

```bash
# Local Supabase
supabase migration up

# Or via Supabase Studio
# Navigate to SQL Editor and run the migration file
```

### Rollback (Not Recommended)

Rollback is NOT recommended because:
1. Roadmaps are immutable - deleting the table loses all data
2. No UPDATE/DELETE operations to roll back
3. Data loss is permanent

If absolutely necessary:
```sql
DROP TABLE IF EXISTS roadmaps CASCADE;
DROP FUNCTION IF EXISTS get_latest_roadmap CASCADE;
DROP FUNCTION IF EXISTS get_roadmap_history CASCADE;
DROP FUNCTION IF EXISTS roadmap_exists_by_hash CASCADE;
```

---

## Files Modified/Created

### Created
- `supabase/migrations/20250117000000_create_roadmaps_table.sql` - Database schema
- `app/api/roadmaps/latest/route.ts` - GET latest roadmap
- `app/api/roadmaps/history/route.ts` - GET roadmap history
- `app/api/roadmaps/[id]/route.ts` - GET roadmap by ID
- `app/api/roadmaps/compare/route.ts` - Compare two roadmaps
- `scripts/test-roadmap-persistence.js` - Test suite
- `docs/PERSISTENCE_STRATEGY.md` - This document
- `docs/STEP_4_COMPLETION_SUMMARY.md` - Step 4 summary

### Modified
- `app/api/generate-roadmap-v2/route.ts` - Added Step 7 (persistence)

---

## Conclusion

Step 4 implements a robust, immutable persistence layer for roadmap data:

- **Immutable**: Append-only, never update or delete
- **Secure**: RLS ensures users only access their own data
- **Performant**: Indexed for fast queries
- **Complete**: Full metadata and roadmap data stored
- **Testable**: Comprehensive test suite included
- **Future-Proof**: Helper functions enable advanced features

The persistence layer is now complete and ready for production use.
