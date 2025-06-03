import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { OPENAI_API_KEY } from '@env';
import { insertQuestionAnswer } from '../db/database';

const suggestions = [
  'Summarize everything in great detail',
  'What did I miss in this conversation?',
  'Key decisions made?',
];

export default function TranscriptChatPanel({
  onClose,
  transcript,
  sessionId,
}: {
  onClose: () => void;
  transcript: string;
  sessionId: number | null;
}) {
    console.log('TranscriptChatPanel received sessionId:', sessionId);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ question: string; answer: string }[]>([]);
  const [webSearch, setWebSearch] = useState(false);

const handleAsk = async (customQuery?: string) => {
  const finalQuery = customQuery || query;
  if (!finalQuery.trim()) return;

  setChat((prev) => [...prev, { question: finalQuery, answer: '...' }]);
  setQuery('');

  const saveToDB = async (question: string, answer: string) => {
    if (!sessionId) return;
    const timestamp = new Date().toISOString();
    try {
      await insertQuestionAnswer(sessionId, question, answer, timestamp);
      console.log('stored in DB:', { question, answer });
    } catch (err) {
      console.error('Failed to store Q&A:', err);
    }
  };

  // Handle short or missing transcript
  if (!transcript || transcript.trim().split(/\s+/).length < 10) {
    const fallback = "The transcript is too brief to answer that. Please continue recording or ask again later.";
    setChat((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].answer = fallback;
      return updated;
    });
    await saveToDB(finalQuery, fallback);
    return;
  }

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
            content: `You are an assistant answering based only on this transcript:\n${transcript}`,
          },
          { role: 'user', content: finalQuery },
        ],
      }),
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No answer found.';

    setChat((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].answer = answer;
      return updated;
    });

    await saveToDB(finalQuery, answer);
  } catch (err) {
    console.error('GPT API error:', err);
    const errorMsg = 'An error occurred while generating the answer.';
    setChat((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].answer = errorMsg;
      return updated;
    });
    await saveToDB(finalQuery, errorMsg);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.panel}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Close Button */}
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.close}>✕</Text>
      </TouchableOpacity>

      {/* Top Input */}
      <TextInput
        style={styles.topInput}
        placeholder="Ask anything about this transcript..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => handleAsk()}
      />

      {/* Suggestions */}
      {chat.length === 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.suggestionRow} onPress={() => handleAsk(item)}>
              <Text style={styles.suggestionText}>{item}</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Web Search Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>🌐 Web Search</Text>
        <Switch value={webSearch} onValueChange={setWebSearch} />
      </View>

      {/* Chat Display */}
      <ScrollView style={styles.chatContainer}>
        {chat.map((item, idx) => (
          <View key={idx} style={styles.chatBlock}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Input */}
      <View style={styles.bottomBar}>
        <TextInput
          style={styles.bottomInput}
          placeholder="Ask anything about this transcript..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleAsk()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  close: {
    fontSize: 24,
    alignSelf: 'flex-start',
    marginBottom: 12,
    color: '#333',
  },
  topInput: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#222',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  toggleLabel: {
    fontSize: 15,
    color: '#444',
  },
  chatContainer: {
    flex: 1,
    marginVertical: 10,
  },
  chatBlock: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#005B9E',
    marginBottom: 4,
  },
  answer: {
    fontSize: 15,
    color: '#222',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },
  bottomInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});