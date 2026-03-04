# Users Table Setup Guide

This guide explains how to set up the users table with role-based access control (admin/user).

## Overview

The `users` table extends Supabase's `auth.users` table with additional user metadata, specifically a `user_type` field that can be either `'admin'` or `'user'`.

## Setup Instructions

### 1. Run the SQL Migration

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-users-table-migration.sql`
5. Click **Run** or press `Ctrl+Enter`

This will:
- Create the `users` table with proper foreign key constraints
- Set up Row Level Security (RLS) policies
- Create triggers for automatic timestamp updates
- Insert your existing user as an admin
- Set up automatic user profile creation for new signups

### 2. Verify the Setup

Run this query in the SQL Editor to verify:

```sql
SELECT * FROM public.users;
```

You should see your user with `user_type = 'admin'`.

### 3. Check Authentication UID

To find your authentication UID:

```sql
SELECT id, email FROM auth.users;
```

## Table Schema

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage in Code

### Using the React Hook (Client Components)

```typescript
import { useUserProfile } from "@/hooks/use-user-profile"

function MyComponent() {
  const { profile, loading, isAdmin, isUser } = useUserProfile()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {isAdmin && <p>You are an admin!</p>}
      {isUser && <p>You are a regular user</p>}
      <p>User Type: {profile?.user_type}</p>
    </div>
  )
}
```

### Using Helper Functions (Client Side)

```typescript
import { getCurrentUserProfile, isAdmin } from "@/lib/user-management"

// Get user profile
const profile = await getCurrentUserProfile()
console.log(profile?.user_type) // 'admin' or 'user'

// Check if admin
const adminStatus = await isAdmin()
if (adminStatus) {
  // Show admin features
}
```

### Using Helper Functions (Server Side)

```typescript
import { getCurrentUserProfileServer, isAdminServer } from "@/lib/user-management"

// In a Server Component or API Route
export default async function Page() {
  const profile = await getCurrentUserProfileServer()
  const isAdmin = await isAdminServer()

  return (
    <div>
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  )
}
```

### Admin-Only Operations

```typescript
import { getAllUsers, updateUserType } from "@/lib/user-management"

// Get all users (admin only)
const users = await getAllUsers()

// Update a user's type (admin only)
await updateUserType('user-uuid-here', 'admin')
```

## Row Level Security (RLS) Policies

The table has the following RLS policies:

1. **Users can view their own profile** - Any authenticated user can read their own data
2. **Users can update their own profile** - Users can update their own data (except user_type)
3. **Admins can view all users** - Admins can read all user profiles
4. **Admins can insert users** - Admins can create new user profiles
5. **Admins can delete users** - Admins can delete user profiles

## Automatic Profile Creation

When a new user signs up through Supabase Auth, a profile is automatically created in the `users` table with:
- `id` = their auth UID
- `user_type` = 'user' (default)

To make someone an admin, update their user_type:

```sql
UPDATE public.users
SET user_type = 'admin'
WHERE id = 'user-uuid-here';
```

## Testing

### Test as Admin User

Your user (ID: `72ba97d3-eed7-487a-81d6-9e6e4b496aa5`) is set up as an admin.

### Create a Test Regular User

1. Sign up a new user through your login page
2. Their profile will be automatically created with `user_type = 'user'`
3. Test that they can only see their own profile

### Promote a User to Admin

```sql
UPDATE public.users
SET user_type = 'admin'
WHERE id = 'new-user-uuid';
```

## TypeScript Types

```typescript
export type UserType = 'admin' | 'user'

export interface UserProfile {
  id: string
  user_type: UserType
  created_at: string
  updated_at: string
}
```

## Troubleshooting

### User profile not created automatically
- Check if the trigger `on_auth_user_created` exists
- Verify the function `handle_new_user()` is created
- Check Supabase logs for errors

### RLS policies not working
- Ensure RLS is enabled: `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
- Verify policies are created correctly
- Check if user is authenticated when accessing data

### Can't update user_type
- Only admins can update user_type through the UI
- Use SQL Editor to manually promote users to admin

## Security Notes

- User types are enforced by database RLS policies
- Users cannot change their own user_type
- All queries respect RLS policies automatically
- The `user_type` field uses a CHECK constraint to ensure only valid values



