# Supabase Singleton Client Fix

## Problem

Multiple Supabase client instances were being created across the application, causing:
- "Multiple GoTrueClient instances detected" warnings
- Session being overwritten/destroyed
- User redirected to login page after roadmap generation
- Session loss after navigation or long-running operations

## Root Cause

Multiple files were creating separate Supabase client instances:
1. `components/RoadmapViewer.tsx` - using `createClientComponentClient()`
2. `app/roadmap/page.tsx` - using `createClientComponentClient()`
3. Each client instance had different storage keys, causing session conflicts

## Solution

### 1. Created Singleton Supabase Client

**File:** `lib/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance
let supabaseInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'pathwise-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  })

  return supabaseInstance
}

// Export singleton instance
export const supabase = getSupabaseClient()
```

**Key Features:**
- ✅ Singleton pattern ensures only ONE client instance across entire app
- ✅ Unique `storageKey: 'pathwise-auth-token'` prevents session overwrites
- ✅ `persistSession: true` ensures session persists across page refreshes
- ✅ `autoRefreshToken: true` handles long-running operations (like 20-second roadmap generation)
- ✅ `detectSessionInUrl: true` handles OAuth redirects

### 2. Updated Client Components

#### components/RoadmapViewer.tsx

**Before:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function RoadmapViewer(...) {
  const supabase = createClientComponentClient()
  // ...
}
```

**After:**
```typescript
import { supabase } from '@/lib/supabase'

export default function RoadmapViewer(...) {
  // Use singleton instance directly
  // ...
}
```

#### app/roadmap/page.tsx

**Before:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function RoadmapPage() {
  const supabase = createClientComponentClient()
  // ...
}
```

**After:**
```typescript
import { supabase } from '@/lib/supabase'

export default function RoadmapPage() {
  // Use singleton instance directly
  // ...
}
```

### 3. Already Using Singleton

These files were already using the singleton correctly:
- ✅ `components/Navbar.tsx`
- ✅ `app/dashboard/page.tsx`
- ✅ `app/personal-dashboard/page.tsx`

### 4. API Routes - No Changes Needed

API routes continue to use server-side `createClient()` with authorization headers:
- `app/api/generate-roadmap/route.ts`
- `app/api/submit-assessment/route.ts`
- `app/api/complete-topic/route.ts`
- `app/api/generate-pre-assessment/route.ts`
- `app/api/evaluate-assessment-optimized/route.ts`
- `app/api/evaluate-assessment/route.ts`

This is the **correct pattern** for API routes in Next.js App Router because:
- API routes run on the server
- They need per-request authentication
- They don't share state with client-side code

## Benefits

1. **No More Multiple Client Warnings** ✅
   - Only ONE Supabase client instance exists in the browser
   - No "Multiple GoTrueClient instances detected" warnings

2. **Session Persistence** ✅
   - Session persists across page refreshes
   - Session survives long-running operations (20+ seconds)
   - Auto token refresh prevents expiry

3. **Reliable Authentication** ✅
   - No unexpected login redirects
   - Session validated before navigation
   - Clear error messages instead of silent failures

4. **Better Performance** ✅
   - Single client = reduced memory usage
   - Shared auth state = fewer API calls
   - Consistent storage key = no conflicts

## Testing Checklist

### Test Case 1: Normal Roadmap Generation
- [ ] Log in to application
- [ ] Complete pre-assessment
- [ ] Click "Generate Roadmap by AI"
- [ ] Wait for 20-second generation
- [ ] Verify no console warnings
- [ ] Click "View My Roadmap" or "Watch your roadmap"
- [ ] Verify roadmap page opens WITHOUT redirect to login
- [ ] Verify session remains valid

### Test Case 2: Page Refresh
- [ ] Generate roadmap
- [ ] Refresh the roadmap page
- [ ] Verify user stays logged in
- [ ] Verify roadmap data loads correctly
- [ ] Check console for no multiple client warnings

### Test Case 3: New Tab Navigation
- [ ] Generate roadmap (opens in new tab)
- [ ] Verify new tab has valid session
- [ ] Close new tab
- [ ] Verify original tab still has session
- [ ] No multiple client warnings in either tab

### Test Case 4: Long Session Duration
- [ ] Log in and generate roadmap
- [ ] Keep tab open for 30+ minutes
- [ ] Navigate to different pages
- [ ] Verify session auto-refreshes
- [ ] No unexpected logouts

## Console Verification

After these fixes, you should see:
```
✅ Session valid, user: <user-id>
✅ Roadmap loaded from database: <roadmap-id>
```

You should NOT see:
```
❌ Multiple GoTrueClient instances detected
❌ ⚠️ No active session found (when session should exist)
```

## Migration Guide

If you add new components that need Supabase:

**DON'T:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
const supabase = createClientComponentClient()
```

**DO:**
```typescript
import { supabase } from '@/lib/supabase'
// Use supabase directly
```

For API routes, continue using:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  }
)
```

## Related Fixes

This fix works in conjunction with:
1. **AUTH_NAVIGATION_FIX.md** - Session validation before navigation
2. **PERSISTENT_STATE_FIX.md** - State persistence across refreshes
3. **ROADMAP_GENERATION_WORKFLOW.md** - Complete roadmap workflow

---

**Status:** ✅ Implemented
**Date:** 2025-01-21
**Version:** 1.0.0
