import { StateGraph, START, END } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage } from '@langchain/core/messages';
import { TavilySearch } from '@langchain/tavily';
import { initChatModel } from 'langchain';
import { AgentState } from './state.js';

const tools = [new TavilySearch({ maxResults: 3 })];
const toolNode = new ToolNode(tools);

const model = await initChatModel('gpt-4o-mini');
const modelWithTools = model.bindTools(tools);

function shouldContinue({ messages }: typeof AgentState.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  if (lastMessage.tool_calls?.length) {
    return 'tools';
  }
  return END;
}

async function callModel(state: typeof AgentState.State) {
  const response = await modelWithTools.invoke(state.messages);
  return { messages: [response] };
}

const builder = new StateGraph(AgentState)
  .addNode('agent', callModel)
  .addEdge(START, 'agent')
  .addNode('tools', toolNode)
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', shouldContinue);

export const graph = builder.compile();

graph.name = 'ReAct Agent';
