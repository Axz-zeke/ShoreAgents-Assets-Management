# User Deletion Setup Guide

## Problem
When deleting a user from the admin panel, the user profile is deleted from `public.users` but the auth account remains in `auth.users`.

## Solutions

There are two ways to properly delete users:

### Option 1: Database Trigger (Recommended)

Run the SQL in `supabase-delete-user-trigger.sql` in your Supabase SQL Editor:

```sql
-- This creates a trigger that automatically deletes auth.users
-- when you delete from public.users
```

**Steps:**
1. Go to Supabase SQL Editor
2. Run `supabase-delete-user-trigger.sql`
3. Now when you delete a user from the admin panel, both the profile AND auth account will be deleted

**Note:** This trigger uses `SECURITY DEFINER` which means it runs with elevated permissions. It bypasses RLS to delete from `auth.users`.

### Option 2: Use Supabase Service Role Key (More Secure)

If the trigger doesn't work due to permission issues, you need to use the Supabase Admin API with the service role key.

**Steps:**

1. Add your service role key to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

2. Update `src/app/api/admin/delete-user/route.ts` to use the service role:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Then use supabaseAdmin.auth.admin.deleteUser(userId)
```

3. Update `src/lib/user-management.ts` to call the API route:

```typescript
export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    if (!response.ok) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}
```

## Current Behavior

Right now:
- ❌ Deleting from admin panel only removes from `public.users`
- ❌ Auth user remains in `auth.users`
- ❌ User can still log in (though they won't have a profile)

After implementing a solution:
- ✅ Deleting from admin panel removes from both tables
- ✅ User cannot log in anymore
- ✅ Complete removal from system

## Recommendation

**Use Option 1 (Database Trigger)** first as it's simpler and doesn't require exposing the service role key. If you encounter permission issues, switch to Option 2.

## Testing

After implementing:

1. Go to `/admin/users`
2. Delete a test user
3. Check Supabase Authentication → Users
4. Verify the user is completely removed
5. Try logging in with that user's credentials (should fail)

## Security Notes

- Only admins can delete users (enforced by RLS policies)
- Users cannot delete their own account through the UI
- Database trigger runs with elevated permissions (SECURITY DEFINER)
- Service role key should NEVER be exposed to the client



