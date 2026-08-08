import React from 'react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

type NavItem = { id: string; label: string; icon: LucideIcon };

interface MobileBottomNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onMore: () => void;
}

export function MobileBottomNav({ items, activeId, onSelect, onMore }: MobileBottomNavProps) {
  const primaryItems = items.slice(0, 4);

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[180] border-t border-slate-200/90 bg-white/95 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect(item.id)}
              className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold transition-colors ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && <span className="absolute inset-1 rounded-2xl bg-blue-50 dark:bg-brand-900/70" />}
              <Icon className="relative z-10" size={21} strokeWidth={isActive ? 2.6 : 2} />
              <span className="relative z-10 truncate">{item.label}</span>
            </motion.button>
          );
        })}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={onMore}
          className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
          aria-label="More navigation options"
        >
          <MoreHorizontal size={21} strokeWidth={2.2} />
          <span>More</span>
        </motion.button>
      </div>
    </nav>
  );
}
