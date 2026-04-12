import 'dotenv/config';
import { initChatModel } from 'langchain';

const model = await initChatModel('gpt-4o-mini');
await model.invoke('Hello, World!');
