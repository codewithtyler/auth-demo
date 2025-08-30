/*
  # Fix Email Domain Validation Logic

  1. Database Functions
    - Update `validate_email_domain` function to properly extract and validate domains
    - Fix domain extraction to handle email addresses correctly
    - Add better error handling and debugging

  2. Testing
    - Function should now properly validate emails
    - Returns proper success/error responses
*/

-- Drop and recreate the validation function with fixed logic
DROP FUNCTION IF EXISTS public.validate_email_domain(text);

CREATE OR REPLACE FUNCTION public.validate_email_domain(email_address text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, auth'
AS $$
DECLARE
  domain_part text;
  is_allowed boolean := false;
  result json;
BEGIN
  -- Basic email validation
  IF email_address IS NULL OR email_address = '' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Email address is required'
    );
  END IF;

  -- Check if email contains @ symbol
  IF position('@' in email_address) = 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid email format'
    );
  END IF;

  -- Extract domain from email (everything after @)
  domain_part := lower(trim(split_part(email_address, '@', 2)));
  
  -- Log for debugging (will appear in Supabase logs)
  RAISE LOG 'Validating email: %, extracted domain: %', email_address, domain_part;
  
  -- Check if domain is empty
  IF domain_part = '' THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid email domain'
    );
  END IF;

  -- Check if domain exists in allowed_domains table
  SELECT EXISTS(
    SELECT 1 FROM public.allowed_domains 
    WHERE lower(domain) = domain_part
  ) INTO is_allowed;
  
  -- Log the result for debugging
  RAISE LOG 'Domain % allowed: %', domain_part, is_allowed;

  -- Return validation result
  IF is_allowed THEN
    result := json_build_object(
      'success', true,
      'message', 'Email domain is valid',
      'domain', domain_part
    );
  ELSE
    result := json_build_object(
      'success', false,
      'message', 'Email domain not allowed. Please use a company email address.',
      'domain', domain_part
    );
  END IF;

  RAISE LOG 'Validation result: %', result;
  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in validate_email_domain: %', SQLERRM;
    RETURN json_build_object(
      'success', false,
      'message', 'Domain validation error: ' || SQLERRM
    );
END;
$$;
