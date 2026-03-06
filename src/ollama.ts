export interface OllamaRequest {
  host: string;
  model: string;
  prompt: string;
  timeoutMs: number;
  thinking: boolean;
  fetchImpl?: typeof fetch;
}

export async function requestOllama({
  host,
  model,
  prompt,
  timeoutMs,
  thinking,
  fetchImpl = fetch
}: OllamaRequest): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = new URL("/api/generate", `${host}/`);
    const response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        think: thinking,
        options: {
          temperature: 0.1,
          num_predict: 80
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}.`);
    }

    const rawText = await response.text();
    let payload: unknown;

    try {
      payload = JSON.parse(rawText);
    } catch {
      throw new Error("Ollama returned invalid JSON.");
    }

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof (payload as { response?: unknown }).response !== "string"
    ) {
      throw new Error("Ollama returned an invalid response payload.");
    }

    const output = (payload as { response: string }).response.trim();

    if (!output) {
      throw new Error("Ollama returned an empty response.");
    }

    return output;
  } finally {
    clearTimeout(timeout);
  }
}
