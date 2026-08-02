import React, { lazy, ComponentType } from 'react';

/**
 * Enhanced lazy import wrapper with automatic retry for ChunkLoadError / dynamic import network failures.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      console.warn('[ChunkGuard] Dynamic import failed, attempting retry...', error);
      
      // Retry once after 800ms delay
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return await factory();
      } catch (secondError: any) {
        // Retry a second time after 1500ms delay
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          return await factory();
        } catch (thirdError: any) {
          console.warn('[ChunkGuard] Dynamic import retry exhausted:', thirdError.message);

          // If page hasn't auto-reloaded for chunk error on this path yet, trigger a reload
          const hasReloadedKey = 'chunk_reload_attempt_' + window.location.pathname;
          const hasReloaded = sessionStorage.getItem(hasReloadedKey);
          
          if (!hasReloaded) {
            sessionStorage.setItem(hasReloadedKey, 'true');
            window.location.reload();
          }

          // Return a graceful fallback component
          return {
            default: ((props: any) => (
              <div className="p-6 my-6 bg-slate-900 border border-amber-500/30 rounded-2xl text-center text-slate-200 shadow-xl max-w-lg mx-auto overflow-hidden">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-base text-white mb-1">Component Update Available</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400 mb-4 leading-relaxed">
                  A newer version of this module was deployed. Please reload the app to update.
                </p>
                <button
                  onClick={() => {
                    sessionStorage.removeItem(hasReloadedKey);
                    window.location.reload();
                  }}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm0 text-white font-bold text-xs rounded-xl transition shadow-lg cursor-pointer overflow-hidden"
                >
                  Reload Component
                </button>
              </div>
            )) as unknown as T,
          };
        }
      }
    }
  });
}
