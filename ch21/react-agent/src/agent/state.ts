import { MessagesValue, StateSchema } from '@langchain/langgraph';

export const AgentState = new StateSchema({
  messages: MessagesValue,
});
