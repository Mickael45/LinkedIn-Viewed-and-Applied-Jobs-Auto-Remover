export function waitForElement(
  selector: string,
  options: { root?: HTMLElement; timeout?: number; signal?: AbortSignal } = {}
): Promise<HTMLElement> {
  const { root = document.body, timeout = 10000, signal } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }

    const existingElement = root.querySelector<HTMLElement>(selector);
    if (existingElement) {
      return resolve(existingElement);
    }

    let observer: MutationObserver | null = null;
    let timerId: number | null = null;

    const cleanup = () => {
      observer?.disconnect();
      if (timerId) clearTimeout(timerId);
      signal?.removeEventListener("abort", handleAbort);
    };

    const handleAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    observer = new MutationObserver(() => {
      const targetElement = root.querySelector<HTMLElement>(selector);
      if (targetElement) {
        cleanup();
        resolve(targetElement);
      }
    });

    timerId = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms.`));
    }, timeout);

    signal?.addEventListener("abort", handleAbort, { once: true });
    observer.observe(root, { childList: true, subtree: true });
  });
}
