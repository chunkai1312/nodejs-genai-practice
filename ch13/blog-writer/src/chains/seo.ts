import { initChatModel } from 'langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CommaSeparatedListOutputParser } from '@langchain/core/output_parsers';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';

const model = await initChatModel('gpt-4o-mini');

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
你是一位 SEO 專家，擅長從內容中提取有效的搜尋關鍵字。

請根據提供的研究資訊，產出 5-10 組適合搜尋優化的關鍵字。

任務要求：
- 與主題高度相關
- 同時包含短尾關鍵字與長尾關鍵字
- 避免過度泛用或模糊的詞彙（如：科技、新聞、文章）
- 考慮用戶可能的搜尋意圖與問句形式

輸出格式：
{format_instructions}
  `,
  ],
  ['human', '{background}'],
]);

const parser = new CommaSeparatedListOutputParser();

export const seoChain = RunnableSequence.from([
  RunnableLambda.from((input: { background: string }) => ({
    background: input.background,
    format_instructions: parser.getFormatInstructions(),
  })),
  prompt,
  model,
  parser,
]);
