import 'dotenv/config';
import readline from 'readline';
import { initChatModel } from 'langchain';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

async function main() {
  const model = await initChatModel('ollama:gpt-oss');

  const messages: BaseMessage[] = [
    new SystemMessage('你是一個樂於助人的 AI 助理。'),
  ];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Local LLM Chatbot 已啟動，輸入訊息開始對話（按 Ctrl+C 離開）。\n');
  rl.setPrompt('> ');
  rl.prompt();

  rl.on('line', async (input) => {
    try {
      messages.push(new HumanMessage(input));
      const stream = await model.stream(messages);
      let aiMessage = '';

      for await (const chunk of stream) {
        process.stdout.write(chunk.text);
        aiMessage += chunk.text;
      }
      process.stdout.write('\n\n');

      messages.push(new AIMessage(aiMessage));
    } catch (err) {
      console.error(err);
    }

    rl.prompt();
  });
}

main();
