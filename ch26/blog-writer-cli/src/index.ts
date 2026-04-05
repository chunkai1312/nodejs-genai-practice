import 'dotenv/config';
import { Client } from '@langchain/langgraph-sdk';
import { input, select } from '@inquirer/prompts';
import ora from 'ora';

const LANGGRAPH_API_URL = process.env.LANGGRAPH_API_URL || 'http://localhost:2024';

async function main() {
  const client = new Client({ apiUrl: LANGGRAPH_API_URL });

  const topic = await input({
    message: '請輸入文章主題：',
    validate: (value) => value.trim() ? true : '主題不能為空',
  });

  console.log('\n開始執行 Blog Writer Agent...\n');

  const thread = await client.threads.create();
  const threadId = thread.thread_id;

  let runInput: any = {
    input: { messages: [{ role: 'user', content: topic }] },
  };

  while (true) {
    const spinner = ora('Agent 執行中...').start();
    const stream = client.runs.stream(threadId, 'agent', runInput);

    for await (const _chunk of stream) {}

    spinner.stop();

    const state = await client.threads.getState(threadId);
    const tasks = state.tasks || [];
    const pendingInterrupt = tasks.find(
      (task: any) => task.interrupts && task.interrupts.length > 0
    );

    if (pendingInterrupt) {
      const interrupt = pendingInterrupt.interrupts[0];
      const resumeValue = await handleInterrupt(interrupt);
      runInput = { command: { resume: resumeValue } };
      continue;
    }

    if (!state.next || state.next.length === 0) {
      console.log('\n文章生成完成！\n');
      console.log('='.repeat(60));
      console.log(state.values?.article);
      console.log('='.repeat(60));
      break;
    }
  }
}

async function handleInterrupt(interrupt: any) {
  const { type, payload } = interrupt.value;
  switch (type) {
    case 'source_review': return handleSourceReview(payload);
    case 'article_revision': return handleArticleRevision(payload);
    default: throw new Error(`未知的中斷類型: ${type}`);
  }
}

async function handleSourceReview(payload: any) {
  console.log('\n來源審查\n');
  console.log('='.repeat(60));
  console.log(`主題: ${payload.topic}\n`);
  console.log(`背景知識:\n${payload.background}\n`);
  console.log('參考來源:');
  payload.references?.forEach((ref: any, i: number) => {
    console.log(`   ${i + 1}. ${ref.title}`);
    console.log(`      ${ref.url}`);
  });
  console.log('='.repeat(60));

  const isApproved = await select({
    message: '請審查以上來源資料：',
    choices: [
      { name: '批准 - 繼續撰寫文章', value: true },
      { name: '退回 - 要求補充或修正', value: false },
    ],
  });

  if (isApproved) {
    return { isApproved: true };
  }

  const feedback = await input({
    message: '請輸入修改建議：',
    validate: (value) => value.trim() ? true : '請提供具體的修改建議',
  });

  return { isApproved: false, feedback };
}

async function handleArticleRevision(payload: any): Promise<any> {
  console.log('\n文章審閱\n');
  console.log('='.repeat(60));
  console.log(payload.draft);
  console.log('='.repeat(60));

  const isApproved = await select({
    message: '請審閱以上文章：',
    choices: [
      { name: '批准 - 確認發佈', value: true },
      { name: '修訂 - 提供修改建議', value: false },
    ],
  });

  if (isApproved) {
    return { isApproved: true };
  }

  const feedback = await input({
    message: '請輸入修訂建議：',
    validate: (value) => value.trim() ? true : '請提供具體的修訂建議',
  });

  return { isApproved: false, feedback };
}

main().catch(console.error);
