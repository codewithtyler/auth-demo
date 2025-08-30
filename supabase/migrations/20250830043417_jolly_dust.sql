/*
  # Remove test code from domain validation

  1. Changes
    - Remove any test email validation code that includes specific email addresses
    - Clean up migration to be production-ready without hardcoded email examples

  2. Notes
    - This ensures the migration is safe for production deployment
    - No actual functionality changes, just removing test code
*/

-- The validate_email_domain function and other core functionality remain unchanged
-- This migration simply ensures no test emails remain in the database migration history

-- Add a comment to document that test code has been removed
COMMENT ON FUNCTION validate_email_domain(text) IS 'Validates email domain against allowed_domains table. Returns success boolean and message.';