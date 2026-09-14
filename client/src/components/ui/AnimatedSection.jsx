import React, { useRef, useState, useEffect } from 'react';

/**
 * AnimatedSection — wraps any section with a scroll-triggered animation.
 * When the section enters the viewport, it adds the `sr-visible` class.
 *
 * Props:
 *   animation: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'flip-up' | 'blur' (default: 'fade-up')
 *   delay: ms delay before animation triggers (default: 0)
 *   duration: override transition duration (optional, e.g. '1.2s')
 *   className: additional class names
 *   tag: HTML tag to render (default: 'div')
 *   threshold: IntersectionObserver threshold (default: 0.12)
 */
export const AnimatedSection = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration,
  className = '',
  tag: Tag = 'div',
  threshold = 0.12,
  style = {},
  ...rest
}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const animClass = `sr-base sr-${animation}${visible ? ' sr-visible' : ''}`;

  return (
    <Tag
      ref={ref}
      className={`${animClass} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        ...(duration ? { transitionDuration: duration } : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/**
 * AnimatedCard — wraps a card/item with scroll-triggered animation + stagger.
 * index: card index used to stagger delay automatically
 */
export const AnimatedCard = ({
  children,
  index = 0,
  animation = 'fade-up',
  baseDelay = 0,
  staggerMs = 120,
  className = '',
  tag: Tag = 'div',
  threshold = 0.08,
  style = {},
  ...rest
}) => {
  const delay = baseDelay + index * staggerMs;
  return (
    <AnimatedSection
      animation={animation}
      delay={delay}
      threshold={threshold}
      className={className}
      tag={Tag}
      style={style}
      {...rest}
    >
      {children}
    </AnimatedSection>
  );
};

/**
 * AnimatedText — animates a single text element (heading, paragraph, span).
 * Great for animating text lines inside cards individually.
 */
export const AnimatedText = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
  tag: Tag = 'div',
  threshold = 0.1,
  ...rest
}) => (
  <AnimatedSection
    animation={animation}
    delay={delay}
    threshold={threshold}
    className={className}
    tag={Tag}
    {...rest}
  >
    {children}
  </AnimatedSection>
);

export default AnimatedSection;
