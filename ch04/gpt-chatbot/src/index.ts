import 'dotenv/config';
import readline from 'node:readline';
import yargs, { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { OpenAI } from 'openai';
import { roles } from './prompts.js';

interface Argv {
  role: keyof typeof roles;
}

const argv = yargs(hideBin(process.argv))
  .option('role', {
    alias: 'r',
    type: 'string',
    choices: Object.keys(roles),
    default: 'default',
    description: '指定助理角色',
  })
  .help()
  .parseSync();

async function main(argv: Arguments<Argv>) {
  const openai = new OpenAI();
  const messages = [...roles[argv.role]];

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

main(argv);
