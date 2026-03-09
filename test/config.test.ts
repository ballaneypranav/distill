import { describe, expect, it } from "bun:test";

import {
  DEFAULT_HOST,
  DEFAULT_MODEL,
  DEFAULT_OPENROUTER_BASE_URL,
  DEFAULT_PROVIDER,
  DEFAULT_TIMEOUT_MS,
  parseCommand,
  resolveRuntimeDefaults,
  UsageError
} from "../src/config";

describe("parseCommand", () => {
  it("parses defaults and joins the question", () => {
    const command = parseCommand(["what", "changed?"], {}, {});

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "what changed?",
        provider: DEFAULT_PROVIDER,
        model: DEFAULT_MODEL,
        host: DEFAULT_HOST,
        apiKey: "",
        timeoutMs: DEFAULT_TIMEOUT_MS,
        thinking: false
      }
    });
  });

  it("supports explicit flags", () => {
    const command = parseCommand(
      [
        "--model",
        "mini",
        "--host=http://example.test",
        "--timeout-ms",
        "10",
        "--thinking",
        "true",
        "summarize"
      ],
      {},
      {}
    );

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "summarize",
        provider: "ollama",
        model: "mini",
        host: "http://example.test",
        apiKey: "",
        timeoutMs: 10,
        thinking: true
      }
    });
  });

  it("uses persisted defaults when present", () => {
    const command = parseCommand(
      ["summarize"],
      {},
      {
        model: "saved-model",
        host: "http://saved.test",
        timeoutMs: 50,
        thinking: true
      }
    );

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "summarize",
        provider: "ollama",
        model: "saved-model",
        host: "http://saved.test",
        apiKey: "",
        timeoutMs: 50,
        thinking: true
      }
    });
  });

  it("parses config set commands", () => {
    expect(parseCommand(["config", "model", "qwen3.5:2b"], {}, {})).toEqual({
      kind: "configSet",
      key: "model",
      value: "qwen3.5:2b"
    });

    expect(parseCommand(["config", "thinking", "false"], {}, {})).toEqual({
      kind: "configSet",
      key: "thinking",
      value: false
    });
  });

  it("resolves env over persisted defaults", () => {
    expect(
      resolveRuntimeDefaults(
        {
          DISTILL_MODEL: "env-model",
          OLLAMA_HOST: "http://env.test",
          DISTILL_TIMEOUT_MS: "999",
          DISTILL_THINKING: "true"
        },
        {
          model: "saved-model",
          host: "http://saved.test",
          timeoutMs: 5,
          thinking: false
        }
      )
    ).toEqual({
      provider: "ollama",
      model: "env-model",
      host: "http://env.test",
      apiKey: "",
      timeoutMs: 999,
      thinking: true
    });
  });

  it("throws on missing question", () => {
    expect(() => parseCommand([], {}, {})).toThrow(UsageError);
  });

  it("throws when openrouter provider has no api key", () => {
    expect(() =>
      parseCommand(["--provider", "openrouter", "summarize"], {}, {})
    ).toThrow(UsageError);
  });

  it("accepts openrouter provider with api key", () => {
    const command = parseCommand(
      ["--provider", "openrouter", "--api-key", "sk-or-test", "summarize"],
      {},
      {}
    );

    expect(command).toEqual({
      kind: "run",
      config: {
        question: "summarize",
        provider: "openrouter",
        model: DEFAULT_MODEL,
        host: DEFAULT_OPENROUTER_BASE_URL,
        apiKey: "sk-or-test",
        timeoutMs: DEFAULT_TIMEOUT_MS,
        thinking: false
      }
    });
  });

  it("resolves openrouter host and api key from env", () => {
    expect(
      resolveRuntimeDefaults(
        {
          DISTILL_PROVIDER: "openrouter",
          OPENROUTER_BASE_URL: "https://custom.openrouter.test/api/v1",
          OPENROUTER_API_KEY: "sk-or-env"
        },
        {}
      )
    ).toEqual({
      provider: "openrouter",
      model: DEFAULT_MODEL,
      host: "https://custom.openrouter.test/api/v1",
      apiKey: "sk-or-env",
      timeoutMs: DEFAULT_TIMEOUT_MS,
      thinking: false
    });
  });

  it("falls back to OPENAI_API_KEY when OPENROUTER_API_KEY is absent", () => {
    const result = resolveRuntimeDefaults(
      {
        DISTILL_PROVIDER: "openrouter",
        OPENAI_API_KEY: "sk-openai-fallback"
      },
      {}
    );

    expect(result.apiKey).toBe("sk-openai-fallback");
  });
});
