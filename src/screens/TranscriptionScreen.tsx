import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import { OPENAI_API_KEY } from '@env';
import transcriptionStyles from '../styles/transcriptionStyles';
import TranscriptChatPanel from '../components/TranscriptChatPanel';
import QuestionsTab from '../components/QuestionTab';
import NotesTab from '../components/NotesTab';
import { fetchLocation } from '../services/locationServices';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { generateTitleFromTranscript } from '../services/stopRecordingService';
import { createCloudSession } from '../services/cloudServiceSession';
import uuid from 'react-native-uuid';
import {
  createSession,
  getSummaryWithTitleBySession,
  getTranscriptsBySession,
  getAllSessionsWithTitles,
} from '../db/database';

const TABS = ['Questions', 'Notes', 'Transcript'];

type SessionRecord = {
  id: number;
  start_time: string;
  location: string;
  title: string | null;
};

export default function TranscriptionScreen({ navigation, route }: any) {
  const { sessionId, readOnly } = route.params || {};
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [activeTab, setActiveTab] = useState('Questions');
  const [recordingStopped, setRecordingStopped] = useState(readOnly || false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const sessionIdRef = useRef<number | null>(sessionId || null);
  const [loadedTranscripts, setLoadedTranscripts] = useState<{ time: string; text: string }[]>([]);

  const {
    recordTime,
    transcripts,
    startRecording,
    stopRecording: stopRecorderHook,
  } = useAudioRecorder(()=>sessionIdRef.current);

  useEffect(() => {
    if (readOnly && sessionId) {
      loadSessionDetails(sessionId);
    } else {
      startNewSession();
    }
  }, []);

  const loadSessionDetails = async (sid: number) => {
    try {
      const summary = await getSummaryWithTitleBySession(sid);
      if (summary?.title) setTitle(summary.title);
      const transcriptData = await getTranscriptsBySession(sid);
      setLoadedTranscripts(
        transcriptData.map((t) => ({
        time: t.timestamp,
        text: t.text
        }))
      );
      const allSessions: SessionRecord[] = await getAllSessionsWithTitles();
      const session = allSessions.find((s) => s.id === sid);
      if (session) {
        setStartTime(session.start_time);
        setLocation(session.location);
      }
    } catch (err) {
      console.error('Failed to load session data:', err);
    }
  };

  const startNewSession = async () => {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fullTime = `${dateStr} • ${timeStr}`;
  setStartTime(fullTime);

  const loc = await fetchLocation();
  setLocation(loc || 'Location unavailable');

  try {
    const cloudId = uuid.v4() as string;    
    const id = await createSession(fullTime, loc || 'Unknown', cloudId);
    console.log('Local session ID:', id);
    sessionIdRef.current = id;
    await createCloudSession(cloudId, 'Untitled', loc || 'Unknown', fullTime); // store same ID in Firestore      
    await startRecording();
  } catch (err) {
    console.error('Session creation failed:', err);
  }
};

const stopRecording = async () => {
  await stopRecorderHook();
  setRecordingStopped(true);
  setActiveTab('Notes');

  let retries = 10;
  while (retries > 0 && transcripts.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries--;
  }

  let allTranscripts = transcripts;

  // Fallback to DB if transcripts are still empty
  if (allTranscripts.length === 0 && sessionIdRef.current) {
    try {
      const dbTranscripts = await getTranscriptsBySession(sessionIdRef.current);
      allTranscripts = dbTranscripts.map(t => ({ time: t.timestamp, text: t.text }));
    } catch (err) {
      console.error('Failed to load transcripts from DB:', err);
    }
  }

  const transcriptText = allTranscripts.map(t => t.text).join(' ').trim();

  if (!transcriptText) {
    console.warn('No transcripts available to generate summary or title.');
    ToastAndroid.show('No transcript available to summarize.', ToastAndroid.LONG);
    return;
  }

  const generatedTitle = await generateTitleFromTranscript(transcriptText);
  setTitle(generatedTitle);
};

  const handleStopPress = async () => {
    if (transcripts.length === 0) {
      ToastAndroid.show(
        'Please wait at least 30 seconds before stopping.',
        ToastAndroid.SHORT
      );
      return;
    }
    await stopRecording();
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Questions':
        return sessionIdRef.current ? (
          <QuestionsTab sessionId={sessionIdRef.current} />
        ) : (
          <Text style={transcriptionStyles.placeholder}>Session not ready yet...</Text>
        );
      case 'Notes':
        return sessionIdRef.current ? (
          <NotesTab sessionId={sessionIdRef.current} />
        ) : (
          <Text style={transcriptionStyles.placeholder}>Session not ready yet...</Text>
        );
      case 'Transcript':
        const displayTranscripts = readOnly ? loadedTranscripts : transcripts;

        return displayTranscripts.length === 0 ? (
        <Text style={transcriptionStyles.placeholder}>Transcript is updated every 30s.</Text>
        ) : (
        <View>
        {displayTranscripts.map((item, index) => (
          <View key={index} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', color: '#005B9E' }}>{item.time}</Text>
            <Text style={{ marginTop: 4 }}>{item.text}</Text>
          </View>
        ))}
        <Text
          style={{
            marginTop: 12,
            fontSize: 12,
            color: 'gray',
            textAlign: 'center'
          }}
        >
          Transcript is updated every 30s.
        </Text>
        </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={transcriptionStyles.container}>
      <View style={transcriptionStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={transcriptionStyles.back}>‹ Back</Text>
        </TouchableOpacity>
        <View style={transcriptionStyles.timerBadge}>
          <Text style={transcriptionStyles.timerText}>{recordTime}</Text>
        </View>
      </View>

      <Text style={transcriptionStyles.title}>{title}</Text>
      <Text style={transcriptionStyles.subtitle}>
        {startTime} • {location}
      </Text>

      <View style={transcriptionStyles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text
              style={[
                transcriptionStyles.tabText,
                activeTab === tab && transcriptionStyles.activeTab,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={transcriptionStyles.content}>{renderTabContent()}</View>

      {showChatPanel ? (
        <TranscriptChatPanel
          onClose={() => setShowChatPanel(false)}
          transcript={transcripts.map((t) => t.text).join('\n')}
          sessionId={sessionIdRef.current}
        />
      ) : (
        <View style={transcriptionStyles.bottomBar}>
          <TouchableOpacity
            style={transcriptionStyles.chatButton}
            onPress={() => setShowChatPanel(true)}
          >
            <Text style={transcriptionStyles.chatText}>Chat with Transcript</Text>
          </TouchableOpacity>
          {!readOnly && (
            <TouchableOpacity
              style={transcriptionStyles.stopButton}
              onPress={handleStopPress}
            >
              <Text style={transcriptionStyles.stopText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}