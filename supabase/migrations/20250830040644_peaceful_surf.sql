/*
  # Authentication Schema Setup

  1. Security
    - Enable RLS on auth.users (handled by Supabase automatically)
    - Create profiles table for additional user data
    - Add email domain validation policies

  2. Functions
    - Create email domain validation function
    - Set up allowed domains configuration
*/

-- Create profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create allowed domains table
CREATE TABLE IF NOT EXISTS public.allowed_domains (
  id serial PRIMARY KEY,
  domain text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for allowed domains
ALTER TABLE public.allowed_domains ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read allowed domains
CREATE POLICY "Authenticated users can read allowed domains"
  ON public.allowed_domains
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to validate email domain
CREATE OR REPLACE FUNCTION public.validate_email_domain(email_address text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  domain_part text;
  is_allowed boolean := false;
BEGIN
  -- Extract domain from email
  domain_part := split_part(email_address, '@', 2);
  
  -- Check if domain is in allowed list
  SELECT EXISTS(
    SELECT 1 FROM public.allowed_domains 
    WHERE domain = domain_part
  ) INTO is_allowed;
  
  -- Return result
  IF is_allowed THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Email domain is allowed',
      'domain', domain_part
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Email domain not allowed. Please use a company email address.',
      'domain', domain_part
    );
  END IF;
END;
$$;

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();