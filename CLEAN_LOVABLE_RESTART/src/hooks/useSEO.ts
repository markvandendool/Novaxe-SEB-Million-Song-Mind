import { useEffect } from 'react';

interface SEOOptions {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g., '/million-song-mind' or full URL
}

export function useSEO({ title, description, canonicalPath }: SEOOptions) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Title
      if (title) document.title = title.slice(0, 60);

      // Description
      if (description) {
        const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (metaDesc) {
          metaDesc.setAttribute('content', description.slice(0, 160));
        } else {
          const meta = document.createElement('meta');
          meta.name = 'description';
          meta.content = description.slice(0, 160);
          document.head.appendChild(meta);
        }
      }

      // Canonical
      const ensureCanonical = (url: string) => {
        let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'canonical';
          document.head.appendChild(link);
        }
        link.href = url;
      };

      if (canonicalPath) {
        const isAbsolute = /^https?:\/\//.test(canonicalPath);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const canonicalUrl = isAbsolute ? canonicalPath : `${origin}${canonicalPath}`;
        ensureCanonical(canonicalUrl);
      }
    }
  }, [title, description, canonicalPath]);
}
