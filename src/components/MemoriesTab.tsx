import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SectionList, StyleSheet } from 'react-native';
import { getAllSessionsWithTitles } from '../db/database';
import { useNavigation } from '@react-navigation/native';
import { format, parse } from 'date-fns';

type Session = {
  id: number;
  start_time: string;
  location: string;
  title: string;
};

export default function MemoriesTab() {
  const [sections, setSections] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadSessions = async () => {
      const sessions = await getAllSessionsWithTitles();
      console.log('Sessions fetched:', sessions);

      const grouped = sessions.reduce((acc: any, session: Session) => {
        try {
          // Clean up: remove bullet and replace weird spaces with normal ones
          const cleaned = session.start_time
            .replace('•', '')
            .replace(/\u202F|\u00A0/g, ' ') // fix narrow non-breaking space and NBSP
            .replace(/\s+/g, ' ')
            .trim();

          const parsedDate = parse(cleaned, 'MMM d, yyyy h:mm a', new Date());
          if (isNaN(parsedDate.getTime())) throw new Error('Invalid date');

          const dayKey = format(parsedDate, 'EEE, MMM d');
          if (!acc[dayKey]) acc[dayKey] = [];

          acc[dayKey].push({ ...session, parsedDate });
        } catch (err) {
          console.error('Error parsing date for session:', session, err);
        }
        return acc;
      }, {});

      const formatted = Object.keys(grouped).map((date) => ({
        title: date,
        data: grouped[date],
      }));

      console.log('Formatted sections:', formatted);
      setSections(formatted);
    };

    loadSessions();
  }, []);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id.toString()}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.dateHeader}>{title}</Text>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.sessionBox}
          onPress={() =>
            navigation.navigate('Transcription', {
              sessionId: item.id,
              readOnly: true,
            })
          }
        >
          <Text style={styles.title}>{item.title || 'Untitled'}</Text>
          <Text style={styles.time}>
            {item.parsedDate ? format(item.parsedDate, 'p') : 'Invalid time'}
          </Text>
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
  sessionBox: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  time: { fontSize: 12, color: '#666' },
});