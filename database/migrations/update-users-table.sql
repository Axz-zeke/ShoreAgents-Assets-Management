-- Add more details to public.users table for easier management
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- Update the handle_new_user function to capture email and metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, user_type, email, first_name, last_name, employee_id)
  VALUES (
    NEW.id, 
    'user', 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'employee_id', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users if needed (though usually only one exists)
UPDATE public.users u
SET 
  email = a.email,
  first_name = COALESCE(a.raw_user_meta_data->>'first_name', ''),
  last_name = COALESCE(a.raw_user_meta_data->>'last_name', '')
FROM auth.users a
WHERE u.id = a.id AND u.email IS NULL;
