import { useEffect, useState } from 'react';
import bundled from './content.json';
import type { Content } from '../types';

/**
 * In production the server writes the live content into the page as a JSON
 * block, so the first paint already has it. The bundled copy is the fallback
 * for `npm run dev` without the API running, and for a server that has no
 * saved content yet.
 */
function embedded(): Content | null {
  try {
    const node = document.getElementById('__content');
    return node?.textContent ? (JSON.parse(node.textContent) as Content) : null;
  } catch {
    return null;
  }
}

export function useContent(): Content {
  const [content, setContent] = useState<Content>(() => embedded() ?? (bundled as Content));

  useEffect(() => {
    if (embedded()) return;
    // Dev server: no embedded block, so ask the API for the edited version.
    let cancelled = false;
    fetch('/api/content')
      .then((response) => (response.ok ? response.json() : null))
      .then((live: Content | null) => {
        if (live && !cancelled) setContent(live);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return content;
}
