import { useEffect, useState, useRef } from 'react';

export function useInView(options = { threshold: 0.1, rootMargin: '0px' }) {
  // Start visible so content never stays blank if the observer
  // mounts after an async loading gate (common on public clinic pages).
  const [isInView, setIsInView] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin]);

  return { ref, isInView };
}
