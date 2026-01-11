/**
 * Maps database and API errors to user-friendly messages
 * Prevents exposure of internal schema details, constraint names, and implementation info
 */
export const mapDatabaseError = (error: unknown): string => {
  // Log full error for debugging (server-side only in production)
  if (import.meta.env.DEV) {
    console.error('Database error:', error);
  }

  const message = error instanceof Error ? error.message : String(error ?? '');
  const lowerMessage = message.toLowerCase();

  // Map specific database errors to user-friendly messages
  if (lowerMessage.includes('duplicate key') || lowerMessage.includes('unique constraint')) {
    return 'This item already exists.';
  }
  
  if (lowerMessage.includes('violates check constraint')) {
    // Handle specific constraint violations
    if (lowerMessage.includes('pincode_format') || lowerMessage.includes('pincode')) {
      return 'Please enter a valid 5-6 digit PIN code.';
    }
    if (lowerMessage.includes('phone_format') || lowerMessage.includes('phone')) {
      return 'Please enter a valid phone number (10-15 digits).';
    }
    if (lowerMessage.includes('medical_conditions_size')) {
      return 'Too many medical conditions listed (max 50).';
    }
    return 'Invalid data format. Please check your input.';
  }
  
  if (lowerMessage.includes('violates foreign key')) {
    return 'Referenced item not found.';
  }
  
  if (lowerMessage.includes('row-level security') || lowerMessage.includes('rls')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (lowerMessage.includes('not found') || lowerMessage.includes('no rows')) {
    return 'The requested item was not found.';
  }
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return 'Request timed out. Please try again.';
  }
  
  if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Generic fallback - never expose raw error messages
  return 'An error occurred. Please try again or contact support if the issue persists.';
};

/**
 * Maps API/Edge Function errors to user-friendly messages
 */
export const mapApiError = (error: unknown): string => {
  if (import.meta.env.DEV) {
    console.error('API error:', error);
  }

  const message = error instanceof Error ? error.message : String(error ?? '');
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('401')) {
    return 'Please log in to continue.';
  }
  
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (lowerMessage.includes('service unavailable') || lowerMessage.includes('503')) {
    return 'Service temporarily unavailable. Please try again later.';
  }

  if (lowerMessage.includes('ai') || lowerMessage.includes('credits')) {
    return 'AI service temporarily unavailable. Please try again later.';
  }

  // Generic fallback
  return 'Unable to process your request. Please try again.';
};
