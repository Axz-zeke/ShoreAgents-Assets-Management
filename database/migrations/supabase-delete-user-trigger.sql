-- Trigger to delete auth.users when public.users is deleted
-- This ensures that when an admin deletes a user profile, the auth account is also removed

-- Create function to delete auth user when profile is deleted
CREATE OR REPLACE FUNCTION public.delete_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the auth user (this requires proper permissions)
  -- Note: This only works if you have proper RLS policies or run as service role
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires before deleting from public.users
DROP TRIGGER IF EXISTS on_user_profile_delete ON public.users;
CREATE TRIGGER on_user_profile_delete
  BEFORE DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_auth_user();

-- Grant necessary permissions
-- Note: This trigger runs as SECURITY DEFINER, so it bypasses RLS
GRANT EXECUTE ON FUNCTION public.delete_auth_user() TO authenticated;

COMMENT ON FUNCTION public.delete_auth_user IS 'Automatically deletes auth.users when public.users is deleted';



