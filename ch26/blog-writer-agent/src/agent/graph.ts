import { StateGraph, START, END, MemorySaver } from '@langchain/langgraph';
import { AgentState } from './state.js';
import { researcherNode } from './nodes/researcher.js';
import { sourceReviewNode } from './nodes/source-review.js';
import { writerNode } from './nodes/writer.js';
import { seoNode } from './nodes/seo.js';
import { editorNode } from './nodes/editor.js';
import { articleRevisionNode } from './nodes/article-revision.js';

const builder = new StateGraph(AgentState)
  .addNode('researcher', researcherNode)
  .addNode('source_review', sourceReviewNode, { ends: ['researcher', 'writer', 'seo'] })
  .addNode('writer', writerNode, { ends: ['editor'] })
  .addNode('seo', seoNode, { ends: ['editor'] })
  .addNode('editor', editorNode)
  .addNode('article_revision', articleRevisionNode, { ends: ['editor', END] })
  .addEdge(START, 'researcher')
  .addEdge('researcher', 'source_review')
  .addEdge('writer', 'editor')
  .addEdge('seo', 'editor')
  .addEdge('editor', 'article_revision')
  .addEdge('article_revision', END);

export const graph: any = builder.compile({
  checkpointer: new MemorySaver(),
});

graph.name = 'Blog Writter Agent';
