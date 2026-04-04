import { createAgent } from 'langchain';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import z from 'zod';
import { AgentState } from '../state.js';

export async function researcherNode(state: typeof AgentState.State) {
  const { messages, topic, background, references, reviewed } = state;

  const client = new MultiServerMCPClient({
    mcpServers: {
      tavily: {
        url: `https://mcp.tavily.com/mcp/?tavilyApiKey=${process.env.TAVILY_API_KEY}`,
        transport: 'http',
      },
    },
  });
  const tools = await client.getTools();
  
  const agent = createAgent({
    model: 'gpt-4o-mini',
    tools,
    systemPrompt: `
你是一位專業研究員，負責根據使用者提供的主題進行調查與整理。  
請務必透過可用的搜尋工具獲取最新、可靠且相關的資訊，並用以補充背景知識。  

請注意:
- 優先檢索最新資料，避免僅依靠舊知識。
- 背景說明需詳盡（至少 1000 字），提供足夠脈絡讓讀者快速理解主題。
- 引用資訊時，請提供清楚的來源與連結（references），確保可追溯性與可信度。
- 如果搜尋結果中包含相互矛盾的觀點，請明確指出並比較。
- 若相關資訊不足，也要誠實說明並提出可能的研究方向。
- 若收到使用者建議，務必依據建議調整研究方向，必要時更新主題描述、背景內容以及參考資料。
    `,
    responseFormat: z.object({
      topic: z.string(),
      background: z.string(),
      references: z.array(
        z.object({
          title: z.string(),
          url: z.string(),
        }),
      )}),
    });

  const result = await agent.invoke({
    messages: {
      role: 'user',
      content: (reviewed as any)?.feedback
        ? `${JSON.stringify({ topic, background, references })}\n\n使用者建議: ${(reviewed as any).feedback}`
        : messages[0]?.content || ''
    }
  });

  return {
    topic: result.structuredResponse.topic,
    background: result.structuredResponse.background,
    references: result.structuredResponse.references,
  };
}
