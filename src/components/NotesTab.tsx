import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { getTranscriptsBySession, insertSummary, getSummaryBySession } from '../db/database';
import { OPENAI_API_KEY } from '@env';

export default function NotesTab({ sessionId }: { sessionId: number }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchOrGenerateSummary = async () => {
      setLoading(true);
      const cached = await getSummaryBySession(sessionId);
      if (cached) {
        setSummary(cached);
        setLoading(false);
        return;
      }

      const transcriptChunks = await getTranscriptsBySession(sessionId);
      const combined = transcriptChunks.map(t => t.text).join('\n');

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
              content: 'Summarize the following meeting transcript in a structured format with key points, actions, and decisions:',
            },
            { role: 'user', content: combined },
          ],
        }),
      });

      const data = await response.json();
      const generated = data.choices?.[0]?.message?.content || 'Summary not available.';
      setSummary(generated);
      await insertSummary(sessionId, generated);
      setLoading(false);
    };

    fetchOrGenerateSummary();
  }, [sessionId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#005B9E" />
      ) : (
        <Text style={styles.text}>{summary || 'No summary available yet.'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  text: { fontSize: 16, color: '#222', lineHeight: 22 },
});