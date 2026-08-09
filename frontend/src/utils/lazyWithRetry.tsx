import React, { ComponentType, useEffect, useState } from 'react';

/**
 * Resilient async component loader.
 *
 * This intentionally does not use React.lazy. React.lazy throws error #306 when
 * a dynamic import resolves to a module without a valid default component.
 * Loading the component through a normal React component lets us validate the
 * module first and show a recoverable UI instead of crashing the application.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return function ResilientLazyComponent(props: React.ComponentProps<T>) {
    const [Component, setComponent] = useState<T | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      let cancelled = false;

      const load = async () => {
        const delays = [0, 800, 1500];
        let lastError: unknown = null;

        for (const delay of delays) {
          if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

          try {
            const module = await factory();
            const resolved = module?.default;

            if (typeof resolved !== 'function' && typeof resolved !== 'object') {
              throw new Error('Dynamic module did not provide a valid default React component.');
            }

            if (!cancelled) setComponent(() => resolved);
            return;
          } catch (error) {
            lastError = error;
            console.warn('[ChunkGuard] Dynamic import attempt failed:', error);
          }
        }

        console.warn('[ChunkGuard] Dynamic import retry exhausted:', lastError);
        if (!cancelled) setFailed(true);
      };

      load();
      return () => {
        cancelled = true;
      };
    }, []);

    if (Component) {
      return <Component {...props} />;
    }

    if (failed) {
      return (
        <div className="p-6 my-6 bg-slate-900 border border-amber-500/30 rounded-2xl text-center text-slate-200 shadow-xl max-w-lg mx-auto overflow-hidden">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-base text-white mb-1">Component Update Available</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            A newer version of this module could not be loaded. Please reload the app to update.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition shadow-lg"
          >
            Reload Component
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  };
}
