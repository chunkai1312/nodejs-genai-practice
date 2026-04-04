import 'dotenv/config';
import readline from 'node:readline';
import { initChatModel } from 'langchain';

async function main() {
  const model = await initChatModel('gpt-4o-mini');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('LLM Chatbot 已啟動，輸入訊息開始對話（按 Ctrl+C 離開）。\n');
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (input) => {
    try {
      const response = await model.invoke(input);
      console.log(`${response.content}\n`);
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });
}

main();
