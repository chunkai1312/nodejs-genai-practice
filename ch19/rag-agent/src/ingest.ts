import 'dotenv/config';
import { OpenAIEmbeddings } from '@langchain/openai';
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

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });

  await QdrantVectorStore.fromDocuments(splittedDocs, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
  });

  console.log('資料匯入完成！');
}

ingest();
