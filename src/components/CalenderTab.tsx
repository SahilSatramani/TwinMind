import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator, StyleSheet } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function CalendarTab() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const fetchCalendarEvents = async () => {
    try {
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const timeMin = new Date().toISOString();
      const timeMax = new Date();
      timeMax.setMonth(timeMax.getMonth() + 1);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(timeMax.toISOString())}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch calendar events');

      const data = await response.json();
      const grouped = groupEventsByDate(data.items || []);
      setSections(grouped);
      setError(null);
    } catch (err: any) {
      console.error('Calendar fetch error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDate = (events: any[]) => {
    const groups: { [key: string]: any[] } = {};

    events.forEach((event) => {
      const dateKey = (event.start?.dateTime || event.start?.date || '').split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return Object.keys(groups)
      .sort()
      .map((date) => ({
        title: formatDate(date),
        data: groups[date],
      }));
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.eventContainer}>
      <Text style={styles.eventTitle}>{item.summary || 'Untitled'}</Text>
      <Text style={styles.eventTime}>
        {formatTime(item.start?.dateTime || item.start?.date || '')} –{' '}
        {formatTime(item.end?.dateTime || item.end?.date || '')}
      </Text>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>{error}</Text>;
  }

  if (sections.length === 0) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>No upcoming events</Text>;
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 6,
    marginLeft: 10,
    color: '#444',
  },
  eventContainer: {
    padding: 12,
    marginVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
  },
});