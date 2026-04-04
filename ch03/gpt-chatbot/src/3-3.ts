import 'dotenv/config';
import readline from 'node:readline';
import { OpenAI } from 'openai';

async function main() {
  const openai = new OpenAI();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('GPT Chatbot 已啟動，輸入訊息開始對話（按 Ctrl+C 離開）。\n');
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (input) => {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: input }],
      });

      console.log(`${response.choices[0].message.content}\n`);
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });
}

main();
