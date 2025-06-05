// services/chatService.ts
import { OPENAI_API_KEY } from '@env';

export const getTranscriptAnswer = async (transcript: string, query: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an assistant answering based only on this transcript:\n${transcript}`,
        },
        { role: 'user', content: query },
      ],
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No answer found.';
};