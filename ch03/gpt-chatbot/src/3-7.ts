import 'dotenv/config';
import readline from 'node:readline';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

async function main() {
  const openai = new OpenAI();
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: '你是一個樂於助人的 AI 助理。' },
  ];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('GPT Chatbot 已啟動，輸入訊息開始對話（按 Ctrl+C 離開）。\n');
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (input) => {
    try {
      messages.push({ role: 'user', content: input });

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
      });

      let content = '';
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          process.stdout.write(chunk.choices[0].delta.content);
          content += chunk.choices[0].delta.content;
        }
      }
      process.stdout.write('\n\n');

      messages.push({ role: 'assistant', content });
    } catch (err) {
      console.error(err);
    }
    rl.prompt();
  });
}

main();
