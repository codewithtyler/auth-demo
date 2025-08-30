/*
  # Fix function search_path issues

  1. Database Functions
    - Drop and recreate `validate_email_domain` with proper search_path
    - Drop and recreate `handle_new_user` with proper search_path  
    - Drop and recreate `create_missing_profiles` with proper search_path
  2. Security
    - Set search_path to 'public, auth' for all functions
    - Maintain existing RLS policies
  3. Trigger
    - Recreate trigger on auth.users for profile creation
*/

-- Drop existing functions and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.validate_email_domain(text);
DROP FUNCTION IF EXISTS public.create_missing_profiles();

-- Create validate_email_domain function with proper search_path
CREATE OR REPLACE FUNCTION public.validate_email_domain(email_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, auth'
AS $$
DECLARE
  domain_part text;
  is_allowed boolean := false;
BEGIN
  -- Extract domain from email
  domain_part := '@' || split_part(email_address, '@', 2);
  
  -- Check if domain is in allowed_domains table
  SELECT EXISTS (
    SELECT 1 FROM public.allowed_domains 
    WHERE domain = domain_part
  ) INTO is_allowed;
  
  -- Return result
  IF is_allowed THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Email domain is allowed'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Email domain not allowed. Please use a company email address.'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error validating email domain'
    );
END;
$$;

-- Create handle_new_user function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, auth'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create missing profiles function with proper search_path
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, auth'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  SELECT 
    au.id,
    au.email,
    au.created_at,
    NOW()
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL
    AND au.email IS NOT NULL;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create missing profiles for any existing users
SELECT public.create_missing_profiles();