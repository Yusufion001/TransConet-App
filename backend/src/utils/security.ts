import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML to prevent XSS attacks.
 */
export const sanitizeHtml = (dirtyHtml: string): string => {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  });
};

/**
 * Escapes plain text for safe rendering, removing all HTML.
 */
export const escapeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validates URLs and detects basic phishing or dangerous schemes.
 */
export const isSafeUrl = (url: string): boolean => {
  if (!url) return true; // empty is 'safe' conceptually, or handled elsewhere
  try {
    const parsed = new URL(url, 'http://localhost');
    const protocol = parsed.protocol.toLowerCase();
    
    // Block javascript: and data: URLs
    if (protocol === 'javascript:' || protocol === 'data:' || protocol === 'vbscript:') {
      return false;
    }
    
    // Simple phishing heuristic: check for excessive @ symbols which obscure the actual domain
    if ((url.match(/@/g) || []).length > 1) {
      return false;
    }

    return true;
  } catch (e) {
    // If it's not a valid URL, treat it as unsafe if it looks like one, but safe if it's just text
    return false;
  }
};
