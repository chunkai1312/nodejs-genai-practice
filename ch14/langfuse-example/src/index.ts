import 'dotenv/config';
import { sdk } from './instrumentation.js';
import { initChatModel } from 'langchain';
import { CallbackHandler } from '@langfuse/langchain';

const langfuseHandler = new CallbackHandler();

const model = await initChatModel('gpt-4o-mini');
await model.invoke('Hello, World!', {
  callbacks: [langfuseHandler],
});

await sdk.shutdown();
