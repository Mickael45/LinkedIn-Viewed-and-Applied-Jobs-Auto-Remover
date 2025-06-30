import { useLayoutEffect, useRef } from "react";
import { subscribeToScroll, unsubscribeFromScroll } from "./animationBus";

export function useParallax<T extends HTMLElement>(speed: number) {
  const elementRef = useRef<T>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const onScroll = (scrollY: number) => {
      element.style.transform = `translateY(${scrollY * speed}px)`;
    };

    subscribeToScroll(onScroll);
    return () => unsubscribeFromScroll(onScroll);
  }, [speed]);

  return elementRef;
}
