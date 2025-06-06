import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import {
  getTranscriptsBySession,
  insertSummary,
  getSummaryWithTitleBySession,
} from '../db/database';
import { saveSummaryToCloud } from '../services/cloudServiceSession';
import { generateSummaryAndTitle } from '../services/summaryService'; 
import { getCloudIdBySessionId } from '../db/database';

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
      console.log(` Waiting for transcript chunks... (${i + 1}/${retries})`);
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

        const transcript = await waitForTranscripts(sessionId);
        const { summary: generatedSummary, title: generatedTitle } =
          await generateSummaryAndTitle(transcript); //service here
        await insertSummary(sessionId, generatedSummary, generatedTitle);
        const cloudId = await getCloudIdBySessionId(sessionId);
        if (cloudId) {
          await saveSummaryToCloud(cloudId, generatedSummary, generatedTitle);
      }
        //await insertSummary(sessionId, generatedSummary, generatedTitle);

        setSummary(generatedSummary);
        setTitle(generatedTitle);
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