/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * This prevents exposing internal system information through error messages.
 */

const authErrorMessages: Record<string, string> = {
  // Email/Password errors
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  
  // Rate limiting
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  
  // Network errors
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/internal-error': 'Something went wrong. Please try again.',
  
  // Phone/OTP errors
  'auth/invalid-phone-number': 'Please enter a valid phone number.',
  'auth/invalid-verification-code': 'Invalid or expired code.',
  'auth/missing-phone-number': 'Please enter a phone number.',
  'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
  'auth/captcha-check-failed': 'Verification failed. Please try again.',
  'auth/missing-verification-code': 'Please enter the verification code.',
  'auth/code-expired': 'Verification code has expired. Please request a new one.',
  
  // OAuth errors
  'auth/popup-blocked': 'Please allow popups for this site.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email.',
  'auth/credential-already-in-use': 'This credential is already linked to another account.',
  
  // Session errors
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'auth/session-expired': 'Your session has expired. Please sign in again.',
};

/**
 * Get a user-friendly error message from a Firebase Auth error.
 * Falls back to a generic message if the error code is not recognized.
 */
export const getAuthErrorMessage = (error: Error): string => {
  const code = (error as any).code;
  
  if (code && authErrorMessages[code]) {
    return authErrorMessages[code];
  }
  
  // Check for common error message patterns and sanitize
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('already registered') || message.includes('already in use')) {
    return 'This email is already registered.';
  }
  
  if (message.includes('invalid') && message.includes('password')) {
    return 'Invalid email or password.';
  }
  
  if (message.includes('network') || message.includes('connection')) {
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
