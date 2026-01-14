/**
 * Maps Supabase Auth error codes/messages to user-friendly messages.
 * This prevents exposing internal system information through error messages.
 */

const authErrorMessages: Record<string, string> = {
  // Email/Password errors
  'user_already_exists': 'This email is already registered.',
  'invalid_credentials': 'Invalid email or password.',
  'invalid_email': 'Please enter a valid email address.',
  'weak_password': 'Password must be at least 6 characters.',
  'email_not_confirmed': 'Please verify your email before signing in.',
  'user_not_found': 'Invalid email or password.',
  'user_banned': 'This account has been disabled.',
  
  // Rate limiting
  'over_request_rate_limit': 'Too many attempts. Please try again later.',
  'over_email_send_rate_limit': 'Too many email requests. Please try again later.',
  'over_sms_send_rate_limit': 'Too many SMS requests. Please try again later.',
  
  // Phone/OTP errors
  'invalid_phone': 'Please enter a valid phone number.',
  'otp_expired': 'Verification code has expired. Please request a new one.',
  'otp_disabled': 'Phone authentication is not enabled.',
  
  // OAuth errors
  'provider_disabled': 'This sign-in method is not available.',
  'unexpected_failure': 'Sign-in was cancelled or failed.',
  
  // Session errors
  'session_expired': 'Your session has expired. Please sign in again.',
  'refresh_token_not_found': 'Your session has expired. Please sign in again.',
};

/**
 * Get a user-friendly error message from a Supabase Auth error.
 * Falls back to a generic message if the error code is not recognized.
 */
export const getAuthErrorMessage = (error: Error | any): string => {
  // Supabase errors often have error_code or code property
  const code = error?.code || error?.error_code || '';
  const message = error?.message?.toLowerCase() || '';
  
  // Check direct code match
  if (code && authErrorMessages[code]) {
    return authErrorMessages[code];
  }
  
  // Handle Firebase errors (from cached old app versions) - redirect to Supabase
  if (message.includes('firebase') || message.includes('api-key-not-valid')) {
    return 'Please clear your browser cache and refresh the page, then try again.';
  }
  
  // Check for common Supabase error message patterns
  if (message.includes('user already registered') || message.includes('already in use')) {
    return 'This email is already registered.';
  }
  
  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Please verify your email before signing in.';
  }
  
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please try again later.';
  }
  
  if (message.includes('invalid phone') || message.includes('phone number')) {
    return 'Please enter a valid phone number.';
  }
  
  if (message.includes('otp') || message.includes('token')) {
    return 'Invalid or expired verification code.';
  }
  
  if (message.includes('network') || message.includes('connection') || message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  
  // Default generic message - never expose raw error details
  return 'Authentication failed. Please try again.';
};

/**
 * Rate limiting utility for client-side auth attempts.
 * Returns true if the action should be blocked.
 */
interface RateLimitState {
  attempts: number;
  lastAttemptTime: number;
  blockedUntil: number;
}

const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60000; // 1 minute
const BLOCK_DURATION_MS = 300000; // 5 minutes after exceeding attempts

export const checkRateLimit = (): { blocked: boolean; remainingSeconds: number } => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const state: RateLimitState = stored 
      ? JSON.parse(stored) 
      : { attempts: 0, lastAttemptTime: 0, blockedUntil: 0 };
    
    const now = Date.now();
    
    // Check if user is currently blocked
    if (state.blockedUntil > now) {
      const remainingSeconds = Math.ceil((state.blockedUntil - now) / 1000);
      return { blocked: true, remainingSeconds };
    }
    
    // Reset attempts if cooldown has passed
    if (now - state.lastAttemptTime > COOLDOWN_MS) {
      state.attempts = 0;
    }
    
    return { blocked: false, remainingSeconds: 0 };
  } catch {
    return { blocked: false, remainingSeconds: 0 };
  }
};

export const recordAuthAttempt = (): { blocked: boolean; remainingSeconds: number } => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const state: RateLimitState = stored 
      ? JSON.parse(stored) 
      : { attempts: 0, lastAttemptTime: 0, blockedUntil: 0 };
    
    const now = Date.now();
    
    // Reset attempts if cooldown has passed
    if (now - state.lastAttemptTime > COOLDOWN_MS) {
      state.attempts = 0;
    }
    
    state.attempts += 1;
    state.lastAttemptTime = now;
    
    // Block if too many attempts
    if (state.attempts >= MAX_ATTEMPTS) {
      state.blockedUntil = now + BLOCK_DURATION_MS;
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
      const remainingSeconds = Math.ceil(BLOCK_DURATION_MS / 1000);
      return { blocked: true, remainingSeconds };
    }
    
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    return { blocked: false, remainingSeconds: 0 };
  } catch {
    return { blocked: false, remainingSeconds: 0 };
  }
};

export const resetRateLimit = (): void => {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {
    // Ignore errors
  }
};
