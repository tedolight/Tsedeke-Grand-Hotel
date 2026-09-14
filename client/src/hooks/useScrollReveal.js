import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useScrollReveal — returns a ref to attach to any element.
 * When the element enters the viewport, it adds the class that
 * triggers the CSS animation defined in scroll-reveal.css.
 *
 * @param {object} options
 * @param {number}  options.threshold  — 0–1 ratio of element visible before triggering (default 0.15)
 * @param {boolean} options.once       — only animate once (default true)
 * @param {string}  options.rootMargin — IntersectionObserver rootMargin (default '0px 0px -60px 0px')
 */
export function useScrollReveal({
  threshold = 0.15,
  once = true,
  rootMargin = '0px 0px -60px 0px',
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return { ref, visible };
}

/**
 * useSectionReveal — convenience wrapper that returns a className string
 * you can spread onto a section wrapper.
 *
 * Usage:
 *   const { ref, className } = useSectionReveal('sr-fade-up');
 *   <div ref={ref} className={className}>…</div>
 */
export function useSectionReveal(animClass = 'sr-fade-up', options = {}) {
  const { ref, visible } = useScrollReveal(options);
  const className = `sr-base ${animClass}${visible ? ' sr-visible' : ''}`;
  return { ref, className, visible };
}
