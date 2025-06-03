import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { getAllQuestionsGrouped } from '../db/database';
import QuestionDetail from './QuestionDetail';
import { format } from 'date-fns';

export default function AllQuestionsTab() {
  const [sections, setSections] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<{ question: string; answer: string } | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      const grouped = await getAllQuestionsGrouped();
      const formatted = Object.keys(grouped).map((date) => ({
        title: date,
        data: grouped[date],
      }));
      setSections(formatted);
    };
    loadQuestions();
  }, []);

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
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.dateHeader}>{title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.questionBox} onPress={() => setSelectedQuestion(item)}>
          <Text style={styles.questionText}>{item.question}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  dateHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  questionBox: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  questionText: {
    fontSize: 14,
    flexShrink: 1,
  },
});