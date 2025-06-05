import { OPENAI_API_KEY } from '@env';

export const generateTitleFromTranscript = async (transcriptText: string): Promise<string> => {
  if (!transcriptText.trim()) return 'Untitled Session';

  try {
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
            content:
              'Given the following transcript, return a concise and descriptive title (max 10 words) summarizing the meeting topic:',
          },
          {
            role: 'user',
            content: transcriptText,
          },
        ],
      }),
    });

    const data = await response.json();
    const generatedTitle = data.choices?.[0]?.message?.content?.trim();

    if (generatedTitle && generatedTitle.length > 3) {
      return generatedTitle;
    }

    const fallback = transcriptText.split(/[.?!]/)[0]?.trim();
    return fallback ? capitalize(fallback.slice(0, 60)) : 'Untitled Session';
  } catch (error) {
    const fallback = transcriptText.split(/[.?!]/)[0]?.trim();
    return fallback ? capitalize(fallback.slice(0, 60)) : 'Untitled Session';
  }
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);