import React, { useEffect } from 'react';

export function DarkModeToggle() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  return null;
}
