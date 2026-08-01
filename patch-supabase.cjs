const fs = require('fs');

const code = `import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key];
  }
  // Try to safely access import.meta.env without breaking ESBuild commonjs
  try {
    const meta = typeof import.meta !== 'undefined' ? (import.meta as any) : null;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch(e) {}
  return undefined;
};

function sanitizeSupabaseUrl(url: string | undefined): string {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (cleanUrl.includes('](')) {
    const parts = cleanUrl.split('](');
    const firstPart = parts[0].replace(/[\\[\\]]/g, '').trim();
    if (firstPart.startsWith('http')) return firstPart;
    const secondPart = parts[1].replace(/[\\)]/g, '').trim();
    if (secondPart.startsWith('http')) return secondPart;
  }
  cleanUrl = cleanUrl.replace(/[\\[\\]\\(\\)]/g, '').trim();
  const urlMatch = cleanUrl.match(/https?:\\/\\/[^\\s]+/);
  if (urlMatch) return urlMatch[0];
  return cleanUrl;
}

function sanitizeSupabaseKey(key: string | undefined): string {
  if (!key) return '';
  let cleanKey = key.trim();
  if (cleanKey.includes('](')) {
    const parts = cleanKey.split('](');
    return parts[0].replace(/[\\[\\]]/g, '').trim();
  }
  return cleanKey.replace(/[\\[\\]\\(\\)]/g, '').trim();
}

const rawSupabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || '';
const rawSupabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '';

const sanitizedUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
const sanitizedKey = sanitizeSupabaseKey(rawSupabaseAnonKey);

const isPlaceholderUrl = !sanitizedUrl || sanitizedUrl.includes('your-project-id') || sanitizedUrl.includes('placeholder');
const isPlaceholderKey = !sanitizedKey || sanitizedKey.includes('your-actual-long-anon') || sanitizedKey.includes('placeholder');

export const isSupabaseConfigured = !!(sanitizedUrl && sanitizedKey && !isPlaceholderUrl && !isPlaceholderKey);

export const supabase = createClient(
  sanitizedUrl || 'https://placeholder.supabase.co',
  sanitizedKey || 'placeholder_key'
);
`;

fs.writeFileSync('src/supabaseClient.ts', code);
