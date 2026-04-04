import { initChatModel } from 'langchain';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { RunnableLambda } from '@langchain/core/runnables';
import { z } from 'zod';
import { searchTool } from '../tools/search.js';

const model = await initChatModel('gpt-4o-mini');
const modelWithTools = model.bindTools([searchTool]);

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
你是一位專業研究員，擅長深入調查並整理可靠的背景資訊。

請根據使用者輸入的主題進行研究，獲取最新且可信的資料。

任務要求：
- 必須使用搜尋工具獲取最新、可靠的資訊
- 優先檢索近期資料，避免僅依賴過時知識
- 背景說明需詳盡（至少 1000 字），提供完整脈絡
- 所有引用必須包含標題與來源連結，確保可追溯性
- 若發現矛盾觀點，請明確指出並比較分析
- 資訊不足時，誠實說明並建議進一步研究方向

輸出格式：
{format_instructions}
  `,
  ],
  ['human', '{topic}'],
]);

const schema = z.object({
  background: z.string(),
  references: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  ),
});

const parser = StructuredOutputParser.fromZodSchema(schema);

export const researcherChain = RunnableLambda.from(async (input: string) => {
  const messages = await prompt.formatMessages({
    topic: input,
    format_instructions: parser.getFormatInstructions(),
  });

  let response = await modelWithTools.invoke(messages);
  messages.push(response);

  while (response.tool_calls?.length) {
    for (const toolCall of response.tool_calls) {
      const toolMessage = await searchTool.invoke(toolCall);
      messages.push(toolMessage);
    }
    response = await model.invoke(messages);
    messages.push(response);
  }

  return parser.parse(response.content as string);
});
