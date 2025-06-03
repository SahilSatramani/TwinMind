import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getQuestionsBySession } from '../db/database';
import QuestionDetail from '../components/QuestionDetail';

export default function QuestionsTab({ sessionId }: { sessionId: number }) {
    
  const [questions, setQuestions] = useState<{ id: number; question: string; answer: string }[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<{ question: string; answer: string } | null>(null);

  useEffect(() => {
    getQuestionsBySession(sessionId).then(setQuestions).catch(console.error);
  }, [sessionId]);

  if (selectedQuestion) {
    return (
      <QuestionDetail
        question={selectedQuestion.question}
        answer={selectedQuestion.answer}
        onClose={() => setSelectedQuestion(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {questions.length === 0 ? (
        <Text style={styles.empty}>No questions yet. Ask something!</Text>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedQuestion(item)}
            >
              <Text style={styles.qText}>❓ {item.question}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  qText: { fontSize: 16, fontWeight: '500' },
  badge: {
    backgroundColor: '#005B9E',
    borderRadius: 20,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: 'white', fontWeight: 'bold' },
});