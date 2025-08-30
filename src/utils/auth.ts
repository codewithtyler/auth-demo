// Authentication utilities - ready for Supabase integration
import { User, LoginCredentials, SignupCredentials } from '../types/auth';

// Placeholder user data structure
const mockUser: User = {
  id: 'demo-user-123',
  email: '',
  created_at: new Date().toISOString()
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication service functions
export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    await delay(1000); // Simulate API call
    
    // Basic validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }
    
    // Basic validation - will be replaced with Supabase authentication
    if (credentials.password.length < 6) {
      throw new Error('Invalid credentials');
    }
    
    return { ...mockUser, email: credentials.email };
  },

  async signup(credentials: SignupCredentials): Promise<User> {
    await delay(1000); // Simulate API call
    
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
    
    return { ...mockUser, email: credentials.email };
  },

  async logout(): Promise<void> {
    await delay(500); // Simulate API call
    localStorage.removeItem('auth-demo-user');
  },

  getCurrentUser(): User | null {
    const stored = localStorage.getItem('auth-demo-user');
    return stored ? JSON.parse(stored) : null;
  },

  setCurrentUser(user: User): void {
    localStorage.setItem('auth-demo-user', JSON.stringify(user));
  }
};