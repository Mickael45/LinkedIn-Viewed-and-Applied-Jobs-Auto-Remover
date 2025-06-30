import { useLayoutEffect, useRef } from "react";
import {
  subscribeToScroll,
  unsubscribeFromScroll,
  subscribeToMouse,
  unsubscribeFromMouse,
} from "./animationBus";

type HookProps = {
  scrollSpeed: number;
  repulsionStrength: number;
  repulsionRadius: number;
  easing: number;
};

export function useDotPhysics<T extends HTMLElement>({
  scrollSpeed,
  repulsionStrength,
  repulsionRadius,
  easing,
}: HookProps) {
  const elementRef = useRef<T>(null);
  const animationFrameId = useRef<number | null>(null);
  const animationState = useRef({
    elementRect: { top: 0, left: 0, width: 0, height: 0 },
    scrollTranslateY: 0,
    targetMouseTranslate: { x: 0, y: 0 },
    currentMouseTranslate: { x: 0, y: 0 },
  });

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const onScroll = (scrollY: number) => {
      animationState.current.scrollTranslateY = scrollY * scrollSpeed;
    };

    const onMouseMove = (mousePos: { x: number; y: number }) => {
      const state = animationState.current;
      const { elementRect } = state;
      const elementCenterX = elementRect.left + elementRect.width / 2;
      const elementCenterY = elementRect.top + elementRect.height / 2;
      const vecX = elementCenterX - mousePos.x;
      const vecY = elementCenterY - mousePos.y;
      const distance = Math.sqrt(vecX * vecX + vecY * vecY);

      if (distance < repulsionRadius) {
        const repulsion =
          ((repulsionRadius - distance) / repulsionRadius) * repulsionStrength;
        const angle = Math.atan2(vecY, vecX);
        state.targetMouseTranslate.x = Math.cos(angle) * repulsion;
        state.targetMouseTranslate.y = Math.sin(angle) * repulsion;
      } else {
        state.targetMouseTranslate.x = 0;
        state.targetMouseTranslate.y = 0;
      }
    };

    const loop = () => {
      const state = animationState.current;
      const { currentMouseTranslate, targetMouseTranslate, scrollTranslateY } =
        state;

      currentMouseTranslate.x +=
        (targetMouseTranslate.x - currentMouseTranslate.x) * easing;
      currentMouseTranslate.y +=
        (targetMouseTranslate.y - currentMouseTranslate.y) * easing;

      element.style.transform = `translate(${currentMouseTranslate.x}px, ${
        scrollTranslateY + currentMouseTranslate.y
      }px)`;
      animationFrameId.current = requestAnimationFrame(loop);
    };

    const updateElementRect = () => {
      animationState.current.elementRect = element.getBoundingClientRect();
    };
    updateElementRect();

    subscribeToScroll(onScroll);
    subscribeToMouse(onMouseMove);
    loop();

    const resizeObserver = new ResizeObserver(updateElementRect);
    resizeObserver.observe(document.body);

    return () => {
      unsubscribeFromScroll(onScroll);
      unsubscribeFromMouse(onMouseMove);
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [scrollSpeed, repulsionStrength, repulsionRadius, easing]);

  return elementRef;
}
