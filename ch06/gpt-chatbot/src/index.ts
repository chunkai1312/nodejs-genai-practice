import 'dotenv/config';
import readline from 'node:readline';
import yargs, { Arguments } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { OpenAI } from 'openai';
import { roles } from './prompts.js';
import { tools, functions } from './tools.js';

interface Argv {
  role: keyof typeof roles;
  temperature: number;
  top_p: number;
}

const argv = yargs(hideBin(process.argv))
  .option('role', {
    alias: 'r',
    type: 'string',
    choices: Object.keys(roles),
    default: 'default',
    description: '指定助理角色',
  })
  .option('temperature', {
    alias: 't',
    type: 'number',
    default: 1,
    description: '控制模型的創意程度 (0.0-2.0)',
  })
  .option('top_p', {
    alias: 'p',
    type: 'number',
    default: 1,
    description: '限制模型的選詞範圍 (0.0-1.0)',
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

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
      });
      const message = response.choices[0].message;

      if (message.tool_calls) {
        const toolCall = message.tool_calls[0];

        if (toolCall.type === 'function') {
          const fn = functions[toolCall.function.name];
          const args = JSON.parse(toolCall.function.arguments);
          const result = await fn(args);

          messages.push(message);
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: result,
          });
        }
      }

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        temperature: argv.temperature,
        top_p: argv.top_p,
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
