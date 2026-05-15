import OpenAI from "openai";

import { config } from "../../config/env.js";

class OpenAITextProvider {
  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  async generateText({ instructions, input, maxOutputTokens, signal }) {
    const response = await this.client.responses.create(
      {
        model: config.aiModel,
        instructions,
        input,
        max_output_tokens: maxOutputTokens
      },
      { signal }
    );

    return {
      text: response.output_text ?? "",
      usage: response.usage ?? null
    };
  }

  async *streamText({ instructions, input, maxOutputTokens, signal }) {
    const stream = await this.client.responses.create(
      {
        model: config.aiModel,
        instructions,
        input,
        max_output_tokens: maxOutputTokens,
        stream: true
      },
      { signal }
    );

    for await (const event of stream) {
      if (event.type === "response.output_text.delta" && event.delta) {
        yield event.delta;
      }
    }
  }
}

let aiTextProvider = new OpenAITextProvider();

export function getAiTextProvider() {
  return aiTextProvider;
}

export function setAiTextProviderForTests(provider) {
  aiTextProvider = provider;
}

export function resetAiTextProviderForTests() {
  aiTextProvider = new OpenAITextProvider();
}

