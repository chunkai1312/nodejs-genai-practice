import { createAgent } from 'langchain';
import z from 'zod';
import { AgentState } from '../state.js';

export async function seoNode(state: typeof AgentState.State) {
  const { topic, background } = state;

  const agent = createAgent({
    model: 'gpt-4o-mini',
    systemPrompt: `
你是一位 SEO 專家。請根據主題與背景資訊，產出 **5–10 組適合搜尋優化的關鍵字**。  

要求:
- 關鍵字需與主題高度相關。  
- 請同時包含「短尾關鍵字」與「長尾關鍵字」。  
- 避免過度泛用或模糊的詞彙（例如：科技、新聞、文章）。  
- 僅輸出關鍵字清單，使用逗號分隔，不要多餘文字。  
    `,
    responseFormat: z.object({
      keywords: z.array(z.string()),
    }),
  });

  const result = await agent.invoke({
    messages: { role: 'user', content: `主題: ${topic}\n背景資訊: ${background}` },
  });

  return {
    keywords: result.structuredResponse.keywords,
  };
}
