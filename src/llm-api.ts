import {
  ACTIVE_LLM_PROVIDER,
  LlmProvider,
  OLLAMA_CONFIG,
  GEMINI_CONFIG,
} from "./config";

class LruCache<K, V> {
  private maxSize: number;
  private cache: Map<K, V>;

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
    this.cache = new Map<K, V>();
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.cache.set(key, item);
    }
    return item;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey === undefined) {
        throw new Error("Cache is empty, cannot evict oldest item.");
      }
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }
}

const llmCache = new LruCache<string, string>(50);

async function _generateHash(data: string): Promise<string> {
  const messageBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

async function getCacheKey(
  prompt: string,
  format: "json" | "text"
): Promise<string> {
  const promptHash = await _generateHash(prompt);
  return `${format}:${promptHash}`;
}

async function _callOllama(
  prompt: string,
  format: "json" | "text"
): Promise<string> {
  const requestBody = {
    model: OLLAMA_CONFIG.MODEL,
    messages: [{ role: "user", content: prompt }],
    stream: false,
    format: format,
    options: {
      temperature: 0,
    },
  };

  const response = await fetch(OLLAMA_CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (data.message?.content) {
    return data.message.content;
  }

  throw new Error("Invalid Ollama response structure.");
}

async function _callGemini(
  prompt: string,
  format: "json" | "text"
): Promise<string> {
  const requestBody: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
    },
  };
  if (format === "json") {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

  const response = await fetch(GEMINI_CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  const errorMessage =
    data.error?.message || "Invalid Gemini response structure.";
  throw new Error(`Gemini API Error: ${errorMessage}`);
}

export async function callLlm(
  prompt: string,
  format: "json" | "text"
): Promise<string> {
  const cacheKey = await getCacheKey(prompt, format);

  const cachedResponse = llmCache.get(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  let response: string;
  try {
    switch (ACTIVE_LLM_PROVIDER) {
      case LlmProvider.OLLAMA:
        response = await _callOllama(prompt, format);
        break;
      case LlmProvider.GEMINI:
        response = await _callGemini(prompt, format);
        break;
      default:
        console.error("Unknown LLM_PROVIDER configured:", ACTIVE_LLM_PROVIDER);
        throw new Error("Invalid LLM provider configured.");
    }

    llmCache.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error("Failed to call LLM provider:", error);
    throw error;
  }
}
