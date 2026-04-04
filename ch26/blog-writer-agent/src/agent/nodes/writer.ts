import { createAgent } from 'langchain';
import z from 'zod';
import { AgentState } from '../state.js';

export async function writerNode(state: typeof AgentState.State) {
  const { topic, background } = state;

  const agent = createAgent({
    model: 'gpt-4o-mini',
    systemPrompt: `
你是一位專業部落格寫手，請根據以下主題與背景知識撰寫一篇文章。  

要求：  
- 文章必須有清晰的結構（引言、主體、結論）。  
- 內容需至少 800 字，條理分明，避免只有單一大段文字。  
- 風格要流暢、具吸引力，讓一般讀者容易理解。  
- 標題要簡潔、吸睛，並能反映主題核心。  
- 適度使用小標題或段落分隔，提升可讀性。  
    `,
    responseFormat: z.object({
      title: z.string(),
      content: z.string(),
    }),
  });

  const result = await agent.invoke({
    messages: { role: 'user', content: `主題: ${topic}\n背景資訊: ${background}` },
  });
    
  return {
    title: result.structuredResponse.title,
    content: result.structuredResponse.content,
  };
}
