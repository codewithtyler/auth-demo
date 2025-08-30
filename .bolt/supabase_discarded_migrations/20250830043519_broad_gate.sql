@@ .. @@
 
 -- Recreate the trigger
 CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-
--- Test the validation function (remove this in production)
-SELECT validate_email_domain('tyler@demo.com') AS test_result;