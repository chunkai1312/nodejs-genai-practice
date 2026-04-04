import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';

let vectorStore: QdrantVectorStore;

export async function getVectorStore() {
  if (!vectorStore) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-3-small',
    });
    vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: process.env.QDRANT_COLLECTION_NAME,
    });
  }
  return vectorStore;
}
