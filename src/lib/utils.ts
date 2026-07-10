import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFriendlyErrorMessage(error: any, defaultMessage = 'Something went wrong. Please try again.') {
  if (!error) return defaultMessage;

  const status = error.status;
  const data = error.data;
  const message = data?.message || error.message || (typeof error === 'string' ? error : '');

  if (status === 401 || status === 403) {
    if (message?.toLowerCase().includes('otp') || message?.toLowerCase().includes('code')) {
      return 'Invalid or expired verification code. Please check your email and try again.';
    }
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (status === 404) {
    return 'We could not find any account with that email address.';
  }

  if (status === 429) {
    return 'Too many attempts. Please try again in a few minutes.';
  }

  if (status === 500) {
    return 'We\'re having trouble connecting to our servers. Please try again in a few minutes.';
  }

  if (message) {
    const msg = message.toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('invalid credentials') || msg.includes('login failed')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (msg.includes('user not found')) {
      return 'No account found with this email address.';
    }
    if (msg.includes('already exists') || msg.includes('email_1_unique') || msg.includes('duplicate')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (msg.includes('network error') || msg.includes('failed to fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (msg.includes('token') && (msg.includes('expired') || msg.includes('invalid'))) {
      return 'Your session has expired. Please sign in again.';
    }
    return message;
  }

  return defaultMessage;
}
