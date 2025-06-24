import { LruCache } from "./cache";
import {
  ACTIVE_LLM_PROVIDER,
  LlmProvider,
  OLLAMA_CONFIG,
  GEMINI_CONFIG,
} from "./config";
import { retry } from "./retry";

async function getCacheKey(
  jobId: string,
  format: "json" | "text"
): Promise<string> {
  return `${format}:${jobId}`;
}

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
    },
  };
  if (format === "json") {
    requestBody.generationConfig.responseMimeType = "application/json";
  }

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
  if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  const errorMessage =
    data.error?.message || "Invalid Gemini response structure.";
  throw new Error(`Gemini API Error: ${errorMessage}`);
}

export async function callLlm(
  prompt: string,
  format: "json" | "text",
  signal: AbortSignal
): Promise<string> {
  console.log("Calling LLM with prompt:", prompt);
  const jobIdStorage = await chrome.storage.session.get("currentJobIdStorage");
  const jobId = jobIdStorage.currentJobIdStorage;

  console.log(jobIdStorage);
  console.log(`Current job ID from storage: ${jobId}`);

  if (!jobId) {
    throw new Error("No job ID found in the current tab URL.");
  }

  console.log(`Job ID: ${jobId}, Format: ${format}`);

  const cacheKey = await getCacheKey(jobId, format);

  console.log(`Cache key: ${cacheKey}`);
  const cachedResponse = await LruCache.getCacheEntry(cacheKey);

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
        throw new Error("Invalid LLM provider configured.");
    }
  };

  try {
    const response = await retry(
      apiCallFn,
      { retries: 3, delay: 1000 },
      signal
    );
    console.log("Song LLM response:", response);
    await LruCache.addToCache(cacheKey, response);
    return response;
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      console.error("Failed to call LLM provider after all retries:", error);
    }
    throw error;
  }
}
