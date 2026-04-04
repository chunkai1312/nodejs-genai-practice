import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getVectorStore } from '../vectorstores/qdrant.js';

export const retrieve = tool(
  async ({ query }) => {
    const vectorStore = await getVectorStore();
    const retriever = vectorStore.asRetriever(3);
    const retrievedDocs = await retriever.invoke(query);
    const serialized = retrievedDocs
      .map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join('\n');
    return [serialized, retrievedDocs];
  },
  {
    name: 'retrieve',
    description: '查詢公司年報並取得與問題最相關的內容片段。',
    schema: z.object({ query: z.string() }),
    responseFormat: 'content_and_artifact',
  }
);
