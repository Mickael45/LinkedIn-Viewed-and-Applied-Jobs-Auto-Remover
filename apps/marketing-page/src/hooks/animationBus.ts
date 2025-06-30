type ScrollListener = (scrollY: number) => void;
type MouseListener = (pos: { x: number; y: number }) => void;

const scrollListeners = new Set<ScrollListener>();
const mouseListeners = new Set<MouseListener>();

let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
let lastMousePos = { x: 0, y: 0 };
let ticking = false;

const onFrame = () => {
  scrollListeners.forEach((listener) => listener(lastScrollY));
  mouseListeners.forEach((listener) => listener(lastMousePos));
  ticking = false;
};

const requestTick = () => {
  if (!ticking) {
    requestAnimationFrame(onFrame);
    ticking = true;
  }
};

const handleScroll = () => {
  lastScrollY = window.scrollY;
  requestTick();
};

const handleMouseMove = (e: MouseEvent) => {
  lastMousePos = { x: e.clientX, y: e.clientY };
  requestTick();
};

if (typeof window !== "undefined") {
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("mousemove", handleMouseMove, { passive: true });
}

export const subscribeToScroll = (callback: ScrollListener) => {
  scrollListeners.add(callback);
  callback(lastScrollY);
};

export const unsubscribeFromScroll = (callback: ScrollListener) => {
  scrollListeners.delete(callback);
};

export const subscribeToMouse = (callback: MouseListener) => {
  mouseListeners.add(callback);
  callback(lastMousePos);
};

export const unsubscribeFromMouse = (callback: MouseListener) => {
  mouseListeners.delete(callback);
};
