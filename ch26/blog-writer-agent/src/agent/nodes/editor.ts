import { createAgent } from 'langchain';
import z from 'zod';
import { AgentState } from '../state.js';

export async function editorNode(state: typeof AgentState.State) {
  const { title, content, keywords, references, draft, revised } = state;

  const agent = createAgent({
    model: 'gpt-4o-mini',
    systemPrompt: `
你是一位專業編輯，請根據提供的資訊撰寫或修改文章，並輸出為 **Markdown 格式**。

要求: 
- 文章必須包含：標題、引言、主體（可用小標題分段）、結論。
- 適度融入提供的 SEO 關鍵字，但不要過度堆疊。
- 使用 Markdown 格式（# 標題、## 小標題、段落、列表）。
- 文風要流暢、自然，適合一般讀者閱讀。
- 若有參考資料，請在文末附上「參考資料」區塊。
- 請在文章最後新增一行，以 #hashtag 形式列出提供的 SEO 關鍵字。
- 若收到使用者修訂建議，務必依照建議進行調整，在保留文章原有結構的基礎上改善內容與表達。
    `,
    responseFormat: z.object({
      draft: z.string(),
    }),
  });
  
  const result = await agent.invoke({
    messages: { 
      role: 'user', 
      content: (revised as any)?.feedback
        ? `使用者修訂建議: ${(revised as any).feedback}\n\n原文章:\n${draft}`
        : JSON.stringify({ title, content, keywords, references })
    },
  });

  return {
    draft: result.structuredResponse.draft,
  };
}
