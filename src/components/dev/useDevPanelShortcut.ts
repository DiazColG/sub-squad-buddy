import { useEffect, useState } from 'react';

// Hook para manejar el atajo Alt + G D C (secuencial dentro de 2.5s)
export function useDevPanelShortcut(onToggle: () => void) {
  const [sequence, setSequence] = useState<string[]>([]);

  useEffect(() => {
    if (!import.meta.env.DEV) return; // sólo en desarrollo

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT','TEXTAREA','SELECT'].includes(target.tagName) || target.isContentEditable) return;
      const required = ['g','d','c'];
      if (!e.altKey) {
        if (sequence.length) setSequence([]);
        return;
      }
      const key = e.key.toLowerCase();
      if (!required.includes(key)) return;
      e.preventDefault();
      const next = [...sequence, key];
      if (next.length > required.length) next.shift();
      setSequence(next);
      if (required.every((r, idx) => next[idx] === r)) {
        onToggle();
        setSequence([]);
      }
    };

    const resetTimer = setInterval(() => {
      if (sequence.length) setSequence([]);
    }, 2500);

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearInterval(resetTimer);
    };
  }, [sequence, onToggle]);
}
