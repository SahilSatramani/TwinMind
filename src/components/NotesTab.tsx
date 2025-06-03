import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {
  getTranscriptsBySession,
  insertSummary,
  getSummaryWithTitleBySession,
} from '../db/database';
import { OPENAI_API_KEY } from '@env';

export default function NotesTab({ sessionId }: { sessionId: number }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('Untitled');
  const [loading, setLoading] = useState(false);

  const waitForTranscripts = async (
    sessionId: number,
    retries = 5,
    delay = 1000
  ): Promise<string> => {
    for (let i = 0; i < retries; i++) {
      const chunks = await getTranscriptsBySession(sessionId);
      if (chunks.length > 0) {
        console.log(`Found ${chunks.length} transcript chunks`);
        return chunks.map((t) => t.text).join('\n');
      }
      console.log(`⏳ Waiting for transcript chunks... (${i + 1}/${retries})`);
      await new Promise((res) => setTimeout(res, delay));
    }
    throw new Error('No transcripts available after waiting.');
  };

  useEffect(() => {
    const fetchOrGenerateSummary = async () => {
      setLoading(true);
      try {
        const cached = await getSummaryWithTitleBySession(sessionId);
        if (cached) {
          setSummary(cached.summary);
          setTitle(cached.title || 'Untitled');
          return;
        }

        const combined = await waitForTranscripts(sessionId);

        // Generate both summary and title via OpenAI
        const summaryPrompt = {
          role: 'system',
          content:
            'Summarize the following meeting transcript in a structured format with key points, actions, and decisions:',
        };

        const titlePrompt = {
          role: 'system',
          content:
            'Given the following transcript, return a concise and descriptive title (max 10 words) summarizing the meeting topic:',
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
              messages: [summaryPrompt, { role: 'user', content: combined }],
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
              messages: [titlePrompt, { role: 'user', content: combined }],
            }),
          }),
        ]);

        const summaryData = await summaryRes.json();
        const titleData = await titleRes.json();

        const generatedSummary =
          summaryData.choices?.[0]?.message?.content || 'Summary not available.';
        const generatedTitle =
          titleData.choices?.[0]?.message?.content?.trim() || 'Untitled';

        setSummary(generatedSummary);
        setTitle(generatedTitle);

        await insertSummary(sessionId, generatedSummary, generatedTitle);
      } catch (err) {
        console.error('Error generating summary or title:', err);
        setSummary('Summary could not be generated. Try again later.');
        setTitle('Untitled');
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateSummary();
  }, [sessionId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#005B9E" />
      ) : (
        <>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{summary || 'No summary available yet.'}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005B9E',
    marginBottom: 12,
  },
  text: { fontSize: 16, color: '#222', lineHeight: 22 },
});