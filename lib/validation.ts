import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format (no verification, just format check)
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email requis' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format email invalide (exemple@exemple.com)' };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number format (French and international)
 */
export function validatePhone(phone: string, defaultCountry: CountryCode = 'FR'): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Numéro de téléphone requis' };
  }
  
  try {
    const phoneNumber = parsePhoneNumber(phone, defaultCountry);
    
    if (!phoneNumber) {
      return { isValid: false, error: 'Numéro de téléphone invalide' };
    }
    
    if (!phoneNumber.isValid()) {
      return { isValid: false, error: 'Numéro de téléphone invalide' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Format de numéro invalide' };
  }
}

/**
 * Validate name (no special characters, reasonable length)
 */
export function validateName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Nom requis' };
  }
  
  if (name.length < 2) {
    return { isValid: false, error: 'Nom trop court (minimum 2 caractères)' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Nom trop long (maximum 100 caractères)' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: 'Nom contient des caractères invalides' };
  }
  
  return { isValid: true };
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate notes field (limited length, sanitized)
 */
export function validateNotes(notes: string): ValidationResult {
  if (!notes) {
    return { isValid: true }; // Notes are optional
  }
  
  if (notes.length > 500) {
    return { isValid: false, error: 'Notes trop longues (maximum 500 caractères)' };
  }
  
  return { isValid: true };
}
