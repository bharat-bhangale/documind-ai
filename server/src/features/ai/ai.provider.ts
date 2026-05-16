import OpenAI from "openai";

import { config } from "../../config/env.js";
import type { AiTextGenerateParams, AiTextGenerateResult, AiTextProvider } from "../../types/index.js";

class OpenAITextProvider implements AiTextProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  async generateText({ instructions, input, maxOutputTokens, signal }: AiTextGenerateParams): Promise<AiTextGenerateResult> {
    const response = await this.client.chat.completions.create(
      {
        model: config.aiModel,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: input }
        ],
        max_tokens: maxOutputTokens
      },
      { signal }
    );

    return {
      text: response.choices[0]?.message.content ?? "",
      usage: response.usage ?? null
    };
  }

  async *streamText({ instructions, input, maxOutputTokens, signal }: AiTextGenerateParams): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create(
      {
        model: config.aiModel,
        messages: [
          { role: "system", content: instructions },
          { role: "user", content: input }
        ],
        max_tokens: maxOutputTokens,
        stream: true
      },
      { signal }
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

let aiTextProvider: AiTextProvider = new OpenAITextProvider();

export function getAiTextProvider(): AiTextProvider {
  return aiTextProvider;
}

export function setAiTextProviderForTests(provider: AiTextProvider): void {
  aiTextProvider = provider;
}

export function resetAiTextProviderForTests(): void {
  aiTextProvider = new OpenAITextProvider();
}
