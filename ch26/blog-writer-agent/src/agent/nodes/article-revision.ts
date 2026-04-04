import { interrupt, Command } from '@langchain/langgraph';
import { AgentState } from '../state.js';

export async function articleRevisionNode(state: typeof AgentState.State) {
  const { draft } = state;

  const revised = interrupt({
    type: 'article_revision',
    payload: { draft },
  });

  if (revised.isApproved) {
    return { article: draft }
  } else {
    return new Command({
      goto: 'editor',
      update: { revised },
    });
  }
}
