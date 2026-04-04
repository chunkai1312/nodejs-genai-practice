import { initChatModel } from 'langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';

interface EditorInput {
  draft: { title: string; content: string };
  keywords: string[];
  references: Array<{ title: string; url: string }>;
}

const model = await initChatModel('gpt-4o-mini');

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
你是一位專業編輯，擅長將內容整合並輸出為清晰易讀的 Markdown 文章。

請根據提供的資訊（標題、內容、關鍵字、參考資料），編輯成完整的 Markdown 格式文章。

任務要求：
- 文章必須包含：標題、引言、主體（可用小標題分段）、結論
- 適度融入提供的 SEO 關鍵字，但不要過度堆疊
- 使用正確的 Markdown 格式（# 標題、## 小標題、段落、列表）
- 文風流暢自然，適合一般讀者閱讀
- 若有參考資料，請在文末附上「參考資料」區塊
- 在文章最後新增一行，以 #hashtag 形式列出 SEO 關鍵字
  `,
  ],
  ['human', '{article_data}'],
]);

const parser = new StringOutputParser();

export const editorChain = RunnableSequence.from([
  RunnableLambda.from((input: EditorInput) => ({
    article_data: JSON.stringify({
      title: input.draft.title,
      content: input.draft.content,
      keywords: input.keywords,
      references: input.references,
    }),
  })),
  prompt,
  model,
  parser,
]);
