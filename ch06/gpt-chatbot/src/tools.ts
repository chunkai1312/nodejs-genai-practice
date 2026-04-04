import { tavily } from '@tavily/core';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'searchWeb',
      description: '根據使用者的問題搜尋最新網路資訊',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '要搜尋的關鍵字或問題內容',
          },
        },
        required: ['query'],
      },
    },
  },
];

export const functions: Record<string, any> = {
  searchWeb: async ({ query }: { query: string }) => {
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const response = await tvly.search(query, { maxResults: 3 });
    return JSON.stringify(response.results);
  },
};
