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
      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: input }],
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          process.stdout.write(chunk.choices[0].delta.content);
        }
      }
      process.stdout.write('\n\n');
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });
}

main();
