import type { RuntimeConfig } from "./config";
import { requestOllama } from "./ollama";
import { buildBatchPrompt, buildWatchPrompt } from "./prompt";

export interface Summarizer {
  summarizeBatch(input: string): Promise<string>;
  summarizeWatch(previousCycle: string, currentCycle: string): Promise<string>;
}

export function createOllamaSummarizer(
  config: RuntimeConfig,
  fetchImpl?: typeof fetch
): Summarizer {
  return {
    summarizeBatch(input: string) {
      return requestOllama({
        host: config.host,
        model: config.model,
        prompt: buildBatchPrompt(config.question, input),
        timeoutMs: config.timeoutMs,
        thinking: config.thinking,
        fetchImpl
      });
    },
    summarizeWatch(previousCycle: string, currentCycle: string) {
      return requestOllama({
        host: config.host,
        model: config.model,
        prompt: buildWatchPrompt(config.question, previousCycle, currentCycle),
        timeoutMs: config.timeoutMs,
        thinking: config.thinking,
        fetchImpl
      });
    }
  };
}
