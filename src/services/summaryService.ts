import { OPENAI_API_KEY } from '@env';

export async function generateSummaryAndTitle(transcript: string): Promise<{ summary: string; title: string }> {
  const summaryPrompt = {
    role: 'system',
    content: 'Summarize the following meeting transcript in a structured format with key points, actions, and decisions:',
  };

  const titlePrompt = {
    role: 'system',
    content: 'Given the following transcript, return a concise and descriptive title (max 10 words) summarizing the meeting topic:',
  };

  const [summaryRes, titleRes] = await Promise.all([
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [summaryPrompt, { role: 'user', content: transcript }],
      }),
    }),
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [titlePrompt, { role: 'user', content: transcript }],
      }),
    }),
  ]);

  const summaryData = await summaryRes.json();
  const titleData = await titleRes.json();

  const summary = summaryData.choices?.[0]?.message?.content || 'Summary not available.';
  const title = titleData.choices?.[0]?.message?.content?.trim() || 'Untitled';

  return { summary, title };
}