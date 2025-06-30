export async function retry<T>(
  asyncFn: () => Promise<T>,
  options: { retries: number; delay: number },
  signal?: AbortSignal
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < options.retries; i++) {
    if (signal?.aborted) {
      throw new DOMException("Request aborted before attempt", "AbortError");
    }

    try {
      return await asyncFn();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      lastError = error as Error;
      if (i < options.retries - 1) {
        const delayMs = options.delay * Math.pow(2, i);
        const jitter = delayMs * 0.2 * Math.random();

        await new Promise((resolve, reject) => {
          const onAbort = () => {
            clearTimeout(timeoutId);
            reject(
              new DOMException("Request aborted during delay", "AbortError")
            );
          };
          const timeoutId = setTimeout(resolve, delayMs + jitter);
          signal?.addEventListener("abort", onAbort, { once: true });
        });
      }
    }
  }
  throw lastError;
}
