export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Formats conversation history into a buffer memory block
 * compatible with LangChain's ConversationBufferMemory.
 */
export function formatConversationBuffer(
  history: ChatHistoryMessage[],
  maxTurns: number = 8
): string {
  if (!history || history.length === 0) {
    return '';
  }

  // Take the most recent turns to maintain context within token limits
  const recent = history.slice(-maxTurns * 2);

  const formattedLines = recent.map((msg) => {
    const speaker = msg.role === 'user' ? 'User' : 'Assistant';
    // Clean up content to single or indented lines
    return `${speaker}: ${msg.content.trim()}`;
  });

  return formattedLines.join('\n\n');
}
