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
import { getTranscriptAnswer } from '../services/chatServices';
import { saveQuestionAnswer } from '../services/qaStorageService';
import { saveQuestionAnswerToCloud } from '../services/cloudServiceSession';

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
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [webSearch, setWebSearch] = useState(false);

  const handleAsk = async (customQuery?: string) => {
    const question = customQuery || query;
    if (!question.trim()) return;

    setChatHistory((prev) => [...prev, { question, answer: '...' }]);
    setQuery('');

    if (!transcript || transcript.trim().split(/\s+/).length < 10) {
      const fallback = "The transcript is too brief to answer that. Please continue recording or ask again later.";
      updateAnswerInChat(fallback);
      await saveQuestionAnswer(sessionId, question, fallback);
      if (sessionId !== null) {
        await saveQuestionAnswerToCloud(sessionId, question, fallback);
      }      
      return;
    }

    try {
      const answer = await getTranscriptAnswer(transcript, question);
      updateAnswerInChat(answer);
      await saveQuestionAnswer(sessionId, question, answer);
    } catch (err) {
      console.error('GPT API error:', err);
      const errorMsg = 'An error occurred while generating the answer.';
      updateAnswerInChat(errorMsg);
      await saveQuestionAnswer(sessionId, question, errorMsg);
    }
  };

  const updateAnswerInChat = (answer: string) => {
    setChatHistory((prev) => {
      const updated = [...prev];
      updated[updated.length - 1].answer = answer;
      return updated;
    });
  };

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.suggestionRow} onPress={() => handleAsk(item)}>
      <Text style={styles.suggestionText}>{item}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.panel} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.close}>✕</Text>
      </TouchableOpacity>

      {chatHistory.length === 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item}
          renderItem={renderSuggestion}
        />
      )}

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>🌐 Web Search</Text>
        <Switch value={webSearch} onValueChange={setWebSearch} />
      </View>

      <ScrollView style={styles.chatContainer}>
        {chatHistory.map((item, index) => (
          <View key={index} style={styles.chatBlock}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}
      </ScrollView>

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