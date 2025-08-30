/*
  # Add demo email domains for testing

  1. Changes
    - Insert common demo domains for testing
    - Allows signup with @demo.com, @test.com, @example.com, and @yourcompany.com emails
  
  2. Notes
    - These domains are for demonstration purposes
    - You can modify or add more domains as needed
*/

-- Insert demo allowed domains
INSERT INTO allowed_domains (domain) VALUES 
  ('demo.com'),
  ('test.com'), 
  ('example.com'),
  ('yourcompany.com'),
  ('gmail.com')
ON CONFLICT (domain) DO NOTHING;