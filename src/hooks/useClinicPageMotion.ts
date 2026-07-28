import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Subtle public-page motion: hero stagger on load + section fades on scroll.
 * Soft y/opacity only — no bounce, elastic, or looping effects.
 */
export function useClinicPageMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;

    if (prefersReducedMotion()) {
      gsap.set(
        root.querySelectorAll(
          '[data-animate="hero"], [data-animate="hero-visual"], [data-animate="section"], [data-animate="item"]'
        ),
        { clearProps: "all" }
      );
      return;
    }

    const ctx = gsap.context(() => {
      const hero = root.querySelectorAll('[data-animate="hero"]');
      const visual = root.querySelector('[data-animate="hero-visual"]');
      const sections = root.querySelectorAll('[data-animate="section"]');

      if (hero.length) {
        gsap.set(hero, { autoAlpha: 0, y: 22 });
        gsap.to(hero, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          stagger: 0.09,
          clearProps: "transform",
        });
      }

      if (visual) {
        gsap.set(visual, { autoAlpha: 0, y: 28 });
        gsap.to(visual, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power2.out",
          delay: 0.12,
          clearProps: "transform",
        });
      }

      sections.forEach((section) => {
        const items = section.querySelectorAll('[data-animate="item"]');
        const targets = items.length ? Array.from(items) : [section];
        gsap.set(targets, { autoAlpha: 0, y: 26 });
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: items.length ? 0.07 : 0,
          clearProps: "transform",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true,
          },
        });
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [enabled, rootRef]);
}
