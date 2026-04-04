import { initChatModel } from 'langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { z } from 'zod';

const model = await initChatModel('gpt-4o-mini');

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
你是一位專業部落格寫手，擅長將研究資料轉化為清晰、吸引人的技術文章。

請根據提供的研究資訊撰寫一篇完整的部落格文章。

任務要求：
- 仔細閱讀研究資料，提取核心觀點，用自己的話重新詮釋（避免直接複製）
- 加入分析與見解，讓內容更有深度與價值
- 文章結構清晰：引言（說明主題重要性）→ 主體（分段論述）→ 結論（總結與啟發）
- 內容至少 800 字，條理分明
- 風格專業但易讀，適合技術背景讀者
- 標題簡潔有力，能反映主題核心
- 適度使用小標題或段落分隔，提升可讀性

輸出格式：
{format_instructions}
  `,
  ],
  ['human', '{background}'],
]);

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    title: z.string(),
    content: z.string(),
  }),
);

export const writerChain = RunnableSequence.from([
  RunnableLambda.from((input: { background: string }) => ({
    background: input.background,
    format_instructions: parser.getFormatInstructions(),
  })),
  prompt,
  model,
  parser,
]);
