import 'dotenv/config';
import { OllamaEmbeddings } from '@langchain/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

async function ingest() {
  const loader = new PDFLoader(process.env.PDF_FILE_PATH as string);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splittedDocs = await splitter.splitDocuments(docs);

  const embeddings = new OllamaEmbeddings({
    model: 'bge-m3',
    baseUrl: process.env.OLLAMA_BASE_URL,
  });

  await QdrantVectorStore.fromDocuments(splittedDocs, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
  });

  console.log('資料匯入完成！');
}

ingest();
