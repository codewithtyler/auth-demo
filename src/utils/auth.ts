// Supabase authentication utilities
import { supabase } from '../lib/supabase';
import { User, LoginCredentials, SignupCredentials } from '../types/auth';

// Email domain validation service
const validateEmailDomain = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-email-domain`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      throw new Error('Domain validation service unavailable');
    }

    return await response.json();
  } catch (error) {
    console.error('Email domain validation error:', error);
    return {
      success: false,
      message: 'Unable to validate email domain. Please try again.'
    };
  }
};

// Convert Supabase user to our User type
const mapSupabaseUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  created_at: supabaseUser.created_at || new Date().toISOString()
});

// Authentication service functions
export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    // Basic validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Attempt login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }

    if (!data.user) {
      throw new Error('Login failed - no user data returned');
    }

    return mapSupabaseUser(data.user);
  },

  async signup(credentials: SignupCredentials): Promise<User> {
    // Validation
    if (!credentials.email || !credentials.password || !credentials.confirmPassword) {
      throw new Error('All fields are required');
    }
    
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('Please enter a valid email address');
    }

    console.log('Starting signup process for:', credentials.email);
    // Step 1: Validate email domain
    console.log('Validating email domain...');
    console.log('Calling domain validation for:', credentials.email);
    const domainValidation = await validateEmailDomain(credentials.email);
    console.log('Domain validation response:', domainValidation);
    console.log('Validation success:', domainValidation.success);
    console.log('Validation message:', domainValidation.message);
    
    if (!domainValidation.success) {
      console.log('Domain validation failed, throwing error:', domainValidation.message);
      throw new Error(domainValidation.message);
    }

    console.log('Domain validation passed, proceeding with Supabase signup...');
    // Step 2: Create user with Supabase
    console.log('Creating Supabase account...');
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
      }
    });

    console.log('Supabase signup result:', { data, error });
    if (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    }

    if (!data.user) {
      throw new Error('Signup failed - no user data returned');
    }

    console.log('Account created successfully:', data.user.id);
    return mapSupabaseUser(data.user);
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  },

  getCurrentUser(): User | null {
    // This will be handled by the auth context through Supabase's session management
    return null;
  },

  setCurrentUser(user: User): void {
    // Not needed with Supabase - session is managed automatically
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback(mapSupabaseUser(session.user));
      } else {
        callback(null);
      }
    });
  }
};