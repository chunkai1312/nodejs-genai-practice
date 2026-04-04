import 'dotenv/config';
import ora from 'ora';
import { RunnableSequence, RunnableParallel, RunnableLambda } from '@langchain/core/runnables';
import { input, confirm } from '@inquirer/prompts';
import { researcherChain } from './chains/researcher.js';
import { writerChain } from './chains/writer.js';
import { seoChain } from './chains/seo.js';
import { editorChain } from './chains/editor.js';

const chain = RunnableSequence.from([
  researcherChain,
  RunnableParallel.from({
    draft: writerChain,
    keywords: seoChain,
    references: RunnableLambda.from((input) => input.references),
  }),
  editorChain,
]);

async function main() {
  console.log('=== Blog Writer 已啟動 ===');

  while (true) {
    const topic = await input({
      message: '請輸入文章主題：',
      validate: (value) => value.trim() ? true : '主題不能為空',
    });

    const spinner = ora('正在產生內容，請稍候...').start();
    try {
      const result = await chain.invoke(topic);
      spinner.succeed('完成!');
      console.log('\n=== 產出結果 ===\n');
      console.log(result);
      console.log('\n=================\n');
    } catch (err) {
      spinner.fail('發生錯誤:');
      console.error(err);
    }

    const again = await confirm({
      message: '要再產生一篇嗎?',
      default: false,
    });

    if (!again) break;
  }
}

main();
