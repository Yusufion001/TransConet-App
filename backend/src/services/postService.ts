// src/services/postService.ts
import { supabase as sb, isSupabaseConfigured } from '../utils/supabaseClient';

// Robust sanitization to handle potential markdown links or bracket formatting in the env vars
function sanitizeSupabaseUrl(url: string | undefined): string {
  if (!url || url === 'undefined' || url === 'null') return '';
  let cleanUrl = url.trim();
  
  if (cleanUrl.includes('](')) {
    const parts = cleanUrl.split('](');
    const firstPart = parts[0].replace(/[\[\]]/g, '').trim();
    if (firstPart.startsWith('http')) {
      return firstPart;
    }
    const secondPart = parts[1].replace(/[\)]/g, '').trim();
    if (secondPart.startsWith('http')) {
      return secondPart;
    }
  }
  
  cleanUrl = cleanUrl.replace(/[\[\]\(\)]/g, '').trim();
  
  const urlMatch = cleanUrl.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    return urlMatch[0];
  }
  
  return cleanUrl;
}

function sanitizeSupabaseKey(key: string | undefined): string {
  if (!key || key === 'undefined' || key === 'null') return '';
  let cleanKey = key.trim();
  
  if (cleanKey.includes('](')) {
    const parts = cleanKey.split('](');
    return parts[0].replace(/[\[\]]/g, '').trim();
  }
  
  return cleanKey.replace(/[\[\]\(\)]/g, '').trim();
}

const rawSupabaseUrl = 
  (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : null) || 
  ((import.meta as any).env?.VITE_SUPABASE_URL) || 
  "";

const rawSupabaseAnonKey = 
  (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : null) || 
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 
  "";

const sanitizedUrl = sanitizeSupabaseUrl(rawSupabaseUrl);
const sanitizedKey = sanitizeSupabaseKey(rawSupabaseAnonKey);

const isPlaceholderUrl = !sanitizedUrl || sanitizedUrl.includes('your-project-id') || sanitizedUrl.includes('placeholder');
const isPlaceholderKey = !sanitizedKey || sanitizedKey.includes('your-actual-long-anon') || sanitizedKey.includes('placeholder');



if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase connection missing or invalid. Operating in high-fidelity offline mode.");
}

import { createClient } from '@supabase/supabase-js';
export const supabase = createClient((sanitizedUrl && sanitizedUrl.startsWith('http')) ? sanitizedUrl : 'https://placeholder.supabase.co', sanitizedKey || 'placeholder-key');

export interface PostPayload {
  author: string;
  role: string;
  text?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
  mediaUrl?: string | null;
}

// Local storage fallback data structure to simulate actual database behavior gracefully
const getLocalPosts = (): any[] => {
  try {
    const data = localStorage.getItem('transconet_fallback_posts');
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse fallback posts:', e);
  }
  return [
    {
      id: 'fallback-1',
      author: 'Musa Babatunde',
      role: 'TRANSPORTER',
      text: 'Verified transit confirmation for Lagos-Kano freight routes on Highway A2. Contact fleet deck directly.',
      mediaType: null,
      mediaUrl: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likes: 12
    },
    {
      id: 'fallback-2',
      author: 'Jimoh Yusuf',
      role: 'SHIPPER',
      text: 'Looking for 30-ton flatbed capacity from Apapa Port to Ibadan. Immediate loading. Legal papers up to date.',
      mediaType: null,
      mediaUrl: null,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      likes: 5
    }
  ];
};

const saveLocalPosts = (posts: any[]) => {
  try {
    localStorage.setItem('transconet_fallback_posts', JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save fallback posts:', e);
  }
};

/**
 * Fetches all live posts from the global timeline, newest first.
 */
export const fetchTimelinePosts = async () => {
  if (!isSupabaseConfigured) {
    return getLocalPosts();
  }

  try {
    let { data, error } = await supabase
      .from('Post')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      // Fallback try 'posts' table name
      const fallbackResult = await supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (fallbackResult.error) {
        console.warn('Supabase fetch timeline failed (tried Post and posts tables):', error.message, fallbackResult.error.message);
        return getLocalPosts();
      }
      data = fallbackResult.data;
    }
    return data || [];
  } catch (err: any) {
    console.warn('Supabase fetch failed, falling back to local simulation:', err.message);
    return getLocalPosts();
  }
};

/**
 * Pushes a new social update live to the database.
 */
export const createTimelinePost = async (payload: PostPayload) => {
  if (!isSupabaseConfigured) {
    const newPost = {
      id: 'local-' + Date.now(),
      author: payload.author,
      role: payload.role,
      text: payload.text || '',
      mediaType: payload.mediaType || null,
      mediaUrl: payload.mediaUrl || null,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    const current = getLocalPosts();
    saveLocalPosts([newPost, ...current]);
    return newPost;
  }

  try {
    const { data, error } = await supabase
      .from('Post')
      .insert([
        {
          author: payload.author,
          role: payload.role,
          text: payload.text,
          mediaType: payload.mediaType,
          mediaUrl: payload.mediaUrl,
          likes: 0,
        },
      ])
      .select();

    if (error) {
      // Fallback try 'posts' table name
      const fallbackResult = await supabase
        .from('posts')
        .insert([
          {
            author: payload.author,
            role: payload.role,
            text: payload.text,
            mediaType: payload.mediaType,
            mediaUrl: payload.mediaUrl,
            likes: 0,
          },
        ])
        .select();

      if (fallbackResult.error) {
        console.warn('Supabase save failed (tried Post and posts tables):', error.message, fallbackResult.error.message);
        throw new Error(fallbackResult.error.message);
      }
      return fallbackResult.data ? fallbackResult.data[0] : null;
    }
    return data ? data[0] : null;
  } catch (err: any) {
    console.warn('Supabase save failed, falling back to local simulation:', err.message);
    const newPost = {
      id: 'local-' + Date.now(),
      author: payload.author,
      role: payload.role,
      text: payload.text || '',
      mediaType: payload.mediaType || null,
      mediaUrl: payload.mediaUrl || null,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    const current = getLocalPosts();
    saveLocalPosts([newPost, ...current]);
    return newPost;
  }
};

/**
 * Deletes a post from the database by its unique ID.
 */
export const deleteTimelinePost = async (postId: string) => {
  if (!isSupabaseConfigured) {
    const current = getLocalPosts();
    const updated = current.filter(p => p.id !== postId);
    saveLocalPosts(updated);
    return true;
  }

  try {
    const { error } = await supabase
      .from('Post')
      .delete()
      .eq('id', postId);

    if (error) {
      // Fallback try 'posts' table name
      const fallbackResult = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (fallbackResult.error) {
        console.warn('Supabase delete failed (tried Post and posts tables):', error.message, fallbackResult.error.message);
        throw new Error(fallbackResult.error.message);
      }
    }
    return true;
  } catch (err: any) {
    console.warn('Supabase delete failed, falling back to local simulation:', err.message);
    const current = getLocalPosts();
    const updated = current.filter(p => p.id !== postId);
    saveLocalPosts(updated);
    return true;
  }
};

/**
 * Increments the likes count of a post.
 */
export const likeTimelinePost = async (postId: string, currentLikes: number) => {
  if (!isSupabaseConfigured) {
    const current = getLocalPosts();
    const updated = current.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p);
    saveLocalPosts(updated);
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('Post')
      .update({ likes: currentLikes + 1 })
      .eq('id', postId)
      .select();

    if (error) {
      // Fallback try 'posts' table name
      const fallbackResult = await supabase
        .from('posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId)
        .select();

      if (fallbackResult.error) {
        console.warn('Supabase like failed (tried Post and posts tables):', error.message, fallbackResult.error.message);
        throw new Error(fallbackResult.error.message);
      }
      return fallbackResult.data ? fallbackResult.data[0] : null;
    }
    return data ? data[0] : null;
  } catch (err: any) {
    console.warn('Supabase like failed, falling back to local simulation:', err.message);
    const current = getLocalPosts();
    const updated = current.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p);
    saveLocalPosts(updated);
    return true;
  }
};

