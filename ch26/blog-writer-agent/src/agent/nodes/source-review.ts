import { interrupt, Command } from '@langchain/langgraph';
import { AgentState } from '../state.js';

export async function sourceReviewNode(state: typeof AgentState.State) {
  const { topic, background, references } = state;

  const reviewed = interrupt({
    type: 'source_review',
    payload: { topic, background, references },
  });

  if (reviewed.isApproved) {
    return new Command({
      goto: ['writer', 'seo'],
      update: { reviewed },
    });
  } else {
    return new Command({
      goto: 'researcher',
      update: { reviewed },
    });
  }
}
