/**
 * Shared validation utilities
 * Általános validációs függvények
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Pozitív szám validáció
 */
export function validatePositiveNumber(
  value: number,
  max?: number,
  min: number = 0,
  fieldName?: string
): ValidationResult {
  if (isNaN(value)) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must be a number`
        : "Value must be a number",
    };
  }

  if (value < min) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must be at least ${min}`
        : `Value must be at least ${min}`,
    };
  }

  if (max !== undefined && value > max) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must not exceed ${max}`
        : `Value must not exceed ${max}`,
    };
  }

  return { isValid: true };
}

/**
 * Százalék validáció (0-100)
 */
export function validatePercentage(value: number, fieldName?: string): ValidationResult {
  return validatePositiveNumber(value, 100, 0, fieldName || "Percentage");
}

/**
 * Email validáció
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      errorMessage: "Email is required",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      errorMessage: "Invalid email format",
    };
  }

  return { isValid: true };
}

/**
 * Kötelező mező validáció
 */
export function validateRequired(value: any, fieldName?: string): ValidationResult {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} is required`
        : "This field is required",
    };
  }

  return { isValid: true };
}

/**
 * Minimum hosszúság validáció
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName?: string
): ValidationResult {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must be at least ${minLength} characters`
        : `Must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Maximum hosszúság validáció
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName?: string
): ValidationResult {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      errorMessage: fieldName
        ? `${fieldName} must not exceed ${maxLength} characters`
        : `Must not exceed ${maxLength} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Több validáció kombinálása
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const firstError = results.find((r) => !r.isValid);
  return firstError || { isValid: true };
}

/**
 * Validációs függvény wrapper
 */
export function validate(
  value: any,
  validators: Array<(value: any) => ValidationResult>
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

