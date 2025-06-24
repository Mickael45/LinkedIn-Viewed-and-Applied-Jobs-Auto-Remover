import {
  ACTIVE_LLM_PROVIDER,
  GEMINI_CONFIG,
  LlmProvider,
  OLLAMA_CONFIG,
} from "../config";
import { lruCache } from "../storage/LruCache";
import { retry } from "../utils/retry";

async function _callOllama(
  prompt: string,
  format: "json" | "text",
  signal: AbortSignal
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
    signal,
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
  format: "json" | "text",
  signal: AbortSignal
): Promise<string> {
  const requestBody: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0,
      responseMimeType: format === "json" ? "application/json" : "text/plain",
    },
  };

  const response = await fetch(GEMINI_CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (content) {
    return content;
  }

  const errorMessage =
    data.error?.message || "Invalid Gemini response structure.";
  throw new Error(`Gemini API Error: ${errorMessage}`);
}

export async function callLlm(
  prompt: string,
  jobId: string,
  format: "json" | "text",
  signal: AbortSignal
): Promise<string> {
  const cacheKey = `${format}:${jobId}`;
  const cachedResponse = await lruCache.get(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  const apiCallFn = () => {
    switch (ACTIVE_LLM_PROVIDER) {
      case LlmProvider.OLLAMA:
        return _callOllama(prompt, format, signal);
      case LlmProvider.GEMINI:
        return _callGemini(prompt, format, signal);
      default:
        const exhaustiveCheck: never = ACTIVE_LLM_PROVIDER;
        throw new Error(`Invalid LLM provider: ${exhaustiveCheck}`);
    }
  };

  const response = await retry(apiCallFn, { retries: 3, delay: 1000 }, signal);
  await lruCache.set(cacheKey, response);
  return response;
}
