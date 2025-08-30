@@ .. @@
   END IF;
   
   RETURN json_build_object('success', true, 'message', 'Email domain is allowed');
 END;
 $$ LANGUAGE plpgsql SECURITY DEFINER;
-
--- Test the function
-SELECT validate_email_domain('tyler@demo.com');