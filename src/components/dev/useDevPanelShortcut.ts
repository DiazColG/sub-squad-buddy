import { useEffect } from 'react';

// Versión simplificada: sólo un atajo directo Ctrl + Alt + D (toggle panel)
// Se eliminó la secuencia previa para evitar conflicto con Alt+G.
export function useDevPanelShortcut(onToggle: () => void) {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT','TEXTAREA','SELECT'].includes(target.tagName) || target.isContentEditable) return;
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggle]);
}


