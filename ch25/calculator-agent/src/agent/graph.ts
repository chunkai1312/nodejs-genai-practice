import { StateGraph, START, END } from '@langchain/langgraph';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';
import { AgentState } from './state.js';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/mcp';

const client = new MultiServerMCPClient({
  mcpServers: {
    'calculator': {
      url: MCP_SERVER_URL,
      transport: 'http',
    },
  },
});
const tools = await client.getTools();

async function agentNode(state: typeof AgentState.State) {
  const agent = createAgent({
    model: 'gpt-4o-mini',
    tools,
  });
  const response = await agent.invoke({ messages: state.messages });
  return { messages: response.messages };
}

const builder = new StateGraph(AgentState)
  .addNode('agent', agentNode)
  .addEdge(START, 'agent')
  .addEdge('agent', END);

export const graph = builder.compile();

graph.name = 'Calculator Agent';
