import 'dotenv/config';
import readline from 'node:readline';
import { createAgent, initChatModel } from 'langchain';
import { retrieve } from './tools/retrieve.js';

async function main() {
  const model = await initChatModel('gpt-4o-mini');

  const agent = createAgent({
    model,
    tools: [retrieve],
    systemPrompt: `
你是一個專門協助解讀公司年報的 AI 助理。
當問題涉及數字、財務段落或年報內容時，請主動使用工具查詢文件內容。
若不需要查詢，可直接回答。
    `,
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('RAG Agent 已啟動，輸入訊息開始對話（按 Ctrl+C 離開）。\n');
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (input) => {
    try {
      const response = await agent.invoke({
        messages: [{ role: 'user', content: input }],
      });
      console.log(`${response.messages.at(-1)?.content}\n`);
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });
}

main();
