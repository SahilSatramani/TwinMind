import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QuestionDetail({
  question,
  answer,
  onClose,
}: {
  question: string;
  answer: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
      <Text style={styles.close} onPress={onClose}>✕</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flex: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#005B9E',
  },
  answer: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  close: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 20,
    color: '#999',
  },
});