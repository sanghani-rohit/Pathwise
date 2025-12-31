# Roadmap Regeneration Strategy

## Overview

**Goal**: Support roadmap regeneration when user skills, assessments, or goals change, while maintaining determinism and providing change awareness.

**Status**: ✅ Implemented in Step 3

---

## Key Concepts

### Determinism vs Regeneration

**Determinism Rule**: Identical inputs → Identical outputs

**Regeneration Principle**: Different inputs → Different outputs (as expected)

**Critical Insight**: Regeneration does NOT break determinism. It simply provides a different input (updated assessment) which should produce a different output.

---

## Versioning Fields (Non-Breaking)

### Added to RoadmapMetadata

```typescript
export interface RoadmapMetadata {
  // ... existing fields ...

  // Optional versioning fields (Step 3 - non-breaking additions)
  roadmap_version?: string  // Version of roadmap (default "1.0")
  generation_reason?: "initial" | "regeneration" | "assessment_update"
}
```

### Field Descriptions

**`roadmap_version`** (optional string)
- Version identifier for the roadmap
- Default: `"1.0"`
- Tracks which roadmap schema version was used
- Future-proofs for schema evolution

**`generation_reason`** (optional enum)
- Why this roadmap was generated
- Values:
  - `"initial"` - First roadmap for this user
  - `"regeneration"` - User requested regeneration (e.g., changed job role)
  - `"assessment_update"` - Re-generated after new assessment results
- Default: `"initial"`

---

## When to Regenerate

### Trigger Conditions

1. **Assessment Updated** (most common)
   - User completed new assessment
   - Skills improved → different track assignments
   - Example: Data Analysis went from 30% → 75%
   - Expected: Module moves from BUILD → IMPROVE track

2. **Job Role Changed**
   - User switched career focus
   - Example: "Data Analyst" → "Machine Learning Engineer"
   - Expected: Completely different roadmap

3. **Skills Added/Removed**
   - User learned new skills outside platform
   - User wants to focus on different areas
   - Example: Added "TensorFlow" to current_skills
   - Expected: TensorFlow modules may move tracks or be removed

4. **Duration/Hours Changed**
   - User changed commitment level
   - Example: 6 months → 3 months
   - Expected: Fewer modules, condensed learning path

### What Changes Trigger Different Input Hash?

The input hash is calculated from:
```typescript
{
  job_role,
  current_skills,
  strong_skills,
  weak_skills,
  assessment: {
    overall_score,
    accuracy_per_skill,
    correct_answers,
    wrong_answers
  },
  duration,
  weekly_hours
}
```

**Any change to these fields** → New input hash → New seed → Different roadmap

---

## Comparison Utility

### Location

`lib/utils/roadmap-comparison.ts`

### Core Function

```typescript
export function compareRoadmaps(
  oldRoadmap: RoadmapOutput,
  newRoadmap: RoadmapOutput
): RoadmapDiff
```

### Returns

```typescript
{
  modules_added: ModuleInfo[]
  modules_removed: ModuleInfo[]
  modules_moved_between_tracks: Array<{
    module_name: string
    from_track: 'BUILD' | 'IMPROVE' | 'REINFORCE'
    to_track: 'BUILD' | 'IMPROVE' | 'REINFORCE'
    from_priority: 'HIGH' | 'MEDIUM' | 'LOW'
    to_priority: 'HIGH' | 'MEDIUM' | 'LOW'
  }>
  priority_changes: Array<{
    track: 'BUILD' | 'IMPROVE' | 'REINFORCE'
    from_priority: 'HIGH' | 'MEDIUM' | 'LOW'
    to_priority: 'HIGH' | 'MEDIUM' | 'LOW'
  }>
  total_hours_changed: {
    old_total: number
    new_total: number
    delta: number
  }
  module_count_changed: {
    old_count: number
    new_count: number
    delta: number
  }
  skills_track_changes: Array<{
    skill_name: string
    from_track: 'BUILD' | 'IMPROVE' | 'REINFORCE' | 'NONE'
    to_track: 'BUILD' | 'IMPROVE' | 'REINFORCE' | 'NONE'
  }>
}
```

### Helper Functions

**`formatDiff(diff: RoadmapDiff): string`**
- Converts diff to human-readable format
- Shows summary with emojis
- Highlights key changes

**`areRoadmapsIdentical(roadmap1, roadmap2): boolean`**
- Quick check if roadmaps are structurally identical
- Returns `true` if no changes detected
- Returns `false` if any structural differences exist

---

## Example Regeneration Scenario

### Initial State

**User Profile**:
- Job Role: Machine Learning Engineer
- Experience: Beginner

**Assessment Results**:
```
Python: 85% (strong)
Data Analysis: 30% (weak)
Statistics: 45% (weak)
Deep Learning: 20% (weak)
MLOps: 15% (weak)
```

**Generated Roadmap**:
- Total Modules: 8
- BUILD Track:
  - Module 1: Python Fundamentals
  - Module 2: Data Analysis Fundamentals
  - Module 3: Statistics for ML
  - Module 4: Deep Learning Basics
  - Module 5: MLOps Fundamentals
- IMPROVE Track: (empty)
- REINFORCE Track:
  - Module 6: Python Best Practices

**Skill Track Assignments**:
- Python → REINFORCE (85% accuracy)
- Data Analysis → BUILD (30% accuracy)
- Statistics → BUILD (45% accuracy)
- Deep Learning → BUILD (20% accuracy)
- MLOps → BUILD (15% accuracy)

---

### After Learning (3 months later)

**Updated Assessment Results**:
```
Python: 90% (strong)
Data Analysis: 75% (improved!)
Statistics: 72% (improved!)
Deep Learning: 50% (improved!)
MLOps: 45% (improved!)
```

**Regenerated Roadmap**:
- Total Modules: 6 (reduced from 8)
- BUILD Track:
  - Module 1: Deep Learning Fundamentals
  - Module 2: MLOps Essentials
- IMPROVE Track:
  - Module 3: Advanced Data Analysis
  - Module 4: Applied Statistics
  - Module 5: Deep Learning Applications
- REINFORCE Track:
  - Module 6: Python Performance Optimization

**Skill Track Assignments** (changed):
- Python → REINFORCE (90% accuracy)
- Data Analysis → IMPROVE (75% accuracy) ✅ Moved from BUILD
- Statistics → IMPROVE (72% accuracy) ✅ Moved from BUILD
- Deep Learning → IMPROVE (50% accuracy) ✅ Moved from BUILD
- MLOps → BUILD (45% accuracy) ⚠️ Still in BUILD (needs more work)

---

### Diff Output

```
═══════════════════════════════════════════════════════════════
ROADMAP COMPARISON SUMMARY
═══════════════════════════════════════════════════════════════

📊 Module Count: 8 → 6 (-2)
⏱️  Total Hours: 288h → 216h (-72h)

❌ MODULES REMOVED:
   - Python Fundamentals (BUILD track, 32h)
   - Statistics for ML (BUILD track, 40h)

✅ MODULES ADDED:
   + Advanced Data Analysis (IMPROVE track, 28h)
   + Applied Statistics (IMPROVE track, 24h)

🔄 MODULES MOVED BETWEEN TRACKS:
   → Data Analysis Fundamentals: BUILD → IMPROVE
   → Deep Learning Basics: BUILD → IMPROVE

🎯 SKILL TRACK ASSIGNMENTS CHANGED:
   → Data Analysis: BUILD → IMPROVE
   → Statistics: BUILD → IMPROVE
   → Deep Learning: BUILD → IMPROVE

═══════════════════════════════════════════════════════════════
📋 TOTAL CHANGES: 7
═══════════════════════════════════════════════════════════════
```

---

## Implementation Details

### API Endpoint Changes

**Location**: `app/api/generate-roadmap-v2/route.ts`

**What Changed**:
```typescript
roadmapData.metadata = {
  // ... existing fields ...
  // Versioning fields (Step 3 - non-breaking additions)
  roadmap_version: '1.0',
  generation_reason: 'initial'  // Default to 'initial'
}
```

**Future Enhancement** (not implemented yet):
```typescript
// Check if previous roadmap exists for this user
const previousRoadmap = await fetchPreviousRoadmap(userId)

const generation_reason = previousRoadmap
  ? (hasAssessmentChanged(previousRoadmap, body) ? 'assessment_update' : 'regeneration')
  : 'initial'
```

---

## Testing Regeneration

### Test Script

**Location**: `scripts/test-roadmap-regeneration.js`

### What It Tests

1. **Generates Initial Roadmap**:
   - Low assessment scores (35% overall)
   - Most skills in BUILD track

2. **Generates Updated Roadmap**:
   - Improved assessment scores (68% overall)
   - Skills moved to IMPROVE/REINFORCE tracks

3. **Compares Roadmaps**:
   - Uses comparison utility
   - Shows detailed diff
   - Saves JSON files for inspection

### Running the Test

```bash
node scripts/test-roadmap-regeneration.js
```

### Expected Output

```
═══════════════════════════════════════════════════════════════
🧪 REGENERATION TEST - ROADMAP GENERATION API v2
═══════════════════════════════════════════════════════════════

INITIAL ASSESSMENT (Low Scores)
   Overall Score: 35%
   Python: 85% (strong)
   Data Analysis: 30% (weak)
   ...

🚀 Initial Generation: Sending request...
✅ Initial Generation: Response received in 8.2s

   Initial Roadmap:
      Total Modules: 8
      Total Hours: 288h
      Input Hash: a3f8e9d2c1b45678...
      Seed: 2751463890

UPDATED ASSESSMENT (Improved Scores)
   Overall Score: 68%
   Python: 90% (strong)
   Data Analysis: 75% (improved from 30%)
   ...

🚀 Updated Generation: Sending request...
✅ Updated Generation: Response received in 8.1s

   Updated Roadmap:
      Total Modules: 6
      Total Hours: 216h
      Input Hash: b7e2d5a8f3c19234...  (different!)
      Seed: 3084729581  (different!)

═══════════════════════════════════════════════════════════════
🔍 COMPARING ROADMAPS
═══════════════════════════════════════════════════════════════

📊 Module Count: 8 → 6 (-2)
⏱️  Total Hours: 288h → 216h (-72h)

🔑 Input Hashes DIFFER (expected - different assessments)
   Old: a3f8e9d2c1b45678...
   New: b7e2d5a8f3c19234...

🎯 SKILL TRACK ASSIGNMENTS CHANGED:
   → Data Analysis: BUILD → IMPROVE
   → Statistics: BUILD → IMPROVE
   → Deep Learning: BUILD → IMPROVE

═══════════════════════════════════════════════════════════════
✅ REGENERATION TEST PASSED
   Detected 7 structural changes
   Assessment improvements correctly reflected in roadmap
═══════════════════════════════════════════════════════════════
```

---

## Use Cases Enabled

### 1. Assessment-Driven Regeneration (Primary)

**Scenario**: User completes roadmap modules, takes new assessment

**Flow**:
1. User completes Module 1-3
2. Takes new assessment
3. Scores improve: Data Analysis 30% → 75%
4. Click "Regenerate Roadmap"
5. API generates new roadmap with updated assessment
6. Frontend shows diff: "Data Analysis moved from BUILD → IMPROVE"
7. User sees optimized learning path

### 2. Job Role Change

**Scenario**: User changes career direction

**Flow**:
1. User started as "Data Analyst"
2. Switches to "Machine Learning Engineer"
3. Regenerates roadmap
4. Completely different modules appear
5. Focus shifts from BI tools to ML algorithms

### 3. Commitment Level Adjustment

**Scenario**: User has less time available

**Flow**:
1. Initially committed 12 hours/week
2. Reduces to 6 hours/week
3. Regenerates roadmap
4. Fewer modules, more focused learning path
5. Duration extended from 6 months → 12 months

### 4. Progress Tracking

**Scenario**: Platform tracks learning progress over time

**Flow**:
1. Store roadmap v1 (initial)
2. User learns for 3 months
3. Generate roadmap v2 (assessment_update)
4. Compare v1 vs v2 to show progress
5. Visualize: "You've mastered 3 skills, moved them from BUILD → REINFORCE"

---

## Future Enhancements (Not Implemented Yet)

### Database Integration

**Feature**: Store all roadmap versions

```typescript
// Pseudo-code
interface RoadmapHistory {
  user_id: string
  roadmap_versions: Array<{
    version: number
    roadmap: RoadmapOutput
    generated_at: string
    generation_reason: string
  }>
}

// Compare current roadmap to previous version
const previousRoadmap = await db.getRoadmap(userId, currentVersion - 1)
const diff = compareRoadmaps(previousRoadmap, newRoadmap)
```

### Automatic Generation Reason Detection

**Feature**: Detect why regeneration was triggered

```typescript
function detectGenerationReason(
  previousRoadmap: RoadmapOutput | null,
  newRequest: GenerateRoadmapRequest
): 'initial' | 'regeneration' | 'assessment_update' {
  if (!previousRoadmap) {
    return 'initial'
  }

  // Check if assessment changed
  const assessmentChanged =
    previousRoadmap.user_profile_summary.assessment_overall_score !==
    newRequest.assessment.overall_score

  if (assessmentChanged) {
    return 'assessment_update'
  }

  return 'regeneration'
}
```

### Smart Diff Presentation

**Feature**: UI component showing diff

```typescript
// Frontend component (pseudo-code)
<RoadmapDiffView
  oldRoadmap={previousRoadmap}
  newRoadmap={currentRoadmap}
  diff={diffData}
/>

// Shows:
// - Green highlights for added modules
// - Red highlights for removed modules
// - Blue arrows for moved modules
// - Skill progress indicators
```

### Rollback Support

**Feature**: Allow users to restore previous roadmap

```typescript
// Pseudo-code
async function rollbackRoadmap(userId: string, targetVersion: number) {
  const previousRoadmap = await db.getRoadmap(userId, targetVersion)
  await db.setActiveRoadmap(userId, previousRoadmap)
  return previousRoadmap
}
```

---

## Safety & Validation

### Schema v1.0 Remains Locked

**Critical**: All versioning fields are **optional** (`?`)

```typescript
roadmap_version?: string  // Optional
generation_reason?: "initial" | "regeneration" | "assessment_update"  // Optional
```

**Backward Compatibility**: ✅ 100%
- Old roadmaps without these fields remain valid
- No database migration needed
- Frontend can safely check for field presence

### No Silent Auto-Fixes

**Rule**: If regeneration fails validation, return error (never auto-fix)

**Example**:
```typescript
if (!validationResult.valid) {
  return NextResponse.json({
    success: false,
    error: 'Generated roadmap failed validation',
    validation_errors: validationResult.errors,
    debug: { raw_llm_output, input_hash, generation_seed }
  }, { status: 500 })
}
```

### Determinism Still Applies

**Guarantee**: Same input → Same output

**Verification**:
1. Generate roadmap A with assessment X
2. Generate roadmap B with assessment X (identical)
3. `compareRoadmaps(A, B)` should show **zero changes**

---

## Comparison Algorithm Details

### Module Matching Strategy

**Problem**: How to identify "same module" across roadmaps?

**Solution**: Case-insensitive name matching

```typescript
function findModuleByName(modules: ModuleInfo[], name: string): ModuleInfo | undefined {
  const normalized = name.toLowerCase().trim()
  return modules.find(m => m.module_name.toLowerCase().trim() === normalized)
}
```

**Why Name-Based?**:
- Module numbers can change (1, 2, 3 → 1, 2, 4)
- Module names are stable identifiers
- Example: "Data Analysis Fundamentals" is unique

**Edge Case**: What if module name changes slightly?
- "Deep Learning Basics" → "Deep Learning Fundamentals"
- Current: Treated as removed + added
- Future: Fuzzy matching (Levenshtein distance)

### Track Priority Comparison

**What We Compare**:
```typescript
const oldTracks = {
  BUILD: roadmap1.roadmap.build_skills.priority,
  IMPROVE: roadmap1.roadmap.improve_skills.priority,
  REINFORCE: roadmap1.roadmap.reinforce_skills.priority
}
```

**Expected Behavior**:
- BUILD always HIGH priority
- IMPROVE always MEDIUM priority
- REINFORCE always LOW priority

**Actual**: Priorities rarely change (schema enforced)

### Skill Track Assignment Comparison

**What We Compare**:
```typescript
roadmap.skill_analysis.skills_validated.forEach(skill => {
  skillsMap.set(skill.skill_name, skill.assigned_track)
})
```

**Example**:
```
Old: { "Data Analysis": "BUILD" }
New: { "Data Analysis": "IMPROVE" }
Result: Data Analysis moved BUILD → IMPROVE
```

**This is the MOST IMPORTANT comparison** because it shows learning progress!

---

## Summary

### ✅ Implemented (Step 3)

1. **Versioning Fields** - Optional metadata fields added
2. **Comparison Utility** - `compareRoadmaps()` function
3. **Regeneration Support** - Different inputs produce different outputs
4. **Test Script** - Automated regeneration testing
5. **Documentation** - This file

### 🔒 Schema Status

- Schema v1.0 remains **LOCKED**
- All new fields are **optional**
- 100% backward compatible

### 📊 Deliverables

- ✅ `lib/types/roadmap.ts` - Added versioning fields
- ✅ `lib/utils/roadmap-comparison.ts` - Comparison utility
- ✅ `app/api/generate-roadmap-v2/route.ts` - Versioning metadata
- ✅ `scripts/test-roadmap-regeneration.js` - Test script
- ✅ `docs/REGENERATION_STRATEGY.md` - This documentation

---

## Next Steps (Not Started)

**Step 4 Candidates** (Awaiting user direction):

1. **Database Integration**
   - Store roadmap history
   - Track versions per user
   - Enable rollback functionality

2. **Frontend Components**
   - Roadmap diff viewer
   - Progress visualization
   - Regeneration button

3. **Automatic Reason Detection**
   - Compare with previous roadmap
   - Set generation_reason automatically

4. **Smart Regeneration Triggers**
   - Auto-suggest regeneration after assessment
   - Detect significant skill improvements

---

**STATUS**: ✅ Step 3 Complete - Ready for User Approval
