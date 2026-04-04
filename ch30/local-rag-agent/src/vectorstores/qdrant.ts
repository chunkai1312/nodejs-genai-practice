import { QdrantVectorStore } from '@langchain/qdrant';
import { OllamaEmbeddings } from '@langchain/ollama';

let vectorStore: QdrantVectorStore;

export async function getVectorStore() {
  if (!vectorStore) {
    const embeddings = new OllamaEmbeddings({
      model: 'bge-m3',
      baseUrl: process.env.OLLAMA_BASE_URL,
    });
    vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: process.env.QDRANT_COLLECTION_NAME,
    });
  }
  return vectorStore;
}
