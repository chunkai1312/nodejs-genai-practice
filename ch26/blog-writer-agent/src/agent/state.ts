import { MessagesValue, StateSchema } from '@langchain/langgraph';
import { z } from 'zod';

export const AgentState = new StateSchema({
  messages: MessagesValue,
  topic: z.string(),
  background: z.string(),
  references: z.array(z.object({ title: z.string(), url: z.string() })),
  title: z.string(),
  content: z.string(),
  keywords: z.array(z.string()),
  draft: z.string(),
  article: z.string(),
  reviewed: z.object({ isApproved: z.boolean(), feedback: z.string().optional() }),
  revised: z.object({ isApproved: z.boolean(), feedback: z.string().optional() }),
});
