import xss from 'xss';

/**
 * Sanitizes input text to prevent Cross-Site Scripting (XSS) attacks.
 * Strips all HTML tags and potentially dangerous attributes.
 */
export const sanitizeInput = (input: string | undefined | null): string => {
  if (typeof input !== 'string') return '';
  return xss(input, {
    whiteList: {}, // empty means all tags are stripped
    stripIgnoreTag: true, // remove all tags not in whitelist
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object'] // remove contents of dangerous tags
  });
};

/**
 * Sanitizes an object's string values (shallow).
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj } as any;
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    }
  }
  return sanitized as T;
};
