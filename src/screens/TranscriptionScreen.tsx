import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import { transcribeAudioChunk } from '../utils/transcribe';
import { GOOGLE_MAPS_API_KEY, OPENAI_API_KEY } from '@env';
import transcriptionStyles from '../styles/transcriptionStyles';
import TranscriptChatPanel from '../components/TranscriptChatPanel';
import QuestionsTab from '../components/QuestionTab';
import NotesTab from '../components/NotesTab';
import {
  createSession,
  insertTranscript,
  getSummaryWithTitleBySession,
  getTranscriptsBySession,
  getAllSessionsWithTitles,
} from '../db/database';

const audioRecorderPlayer = new AudioRecorderPlayer();
const TABS = ['Questions', 'Notes', 'Transcript'];

type SessionRecord = {
  id: number;
  start_time: string;
  location: string;
  title: string | null;
};

export default function TranscriptionScreen({ navigation, route }: any) {
  const { sessionId, readOnly } = route.params || {};
  const [recordTime, setRecordTime] = useState('00:00');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [activeTab, setActiveTab] = useState('Questions');
  const [recordingStopped, setRecordingStopped] = useState(readOnly || false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [transcripts, setTranscripts] = useState<{ time: string; text: string }[]>([]);
  const sessionIdRef = useRef<number | null>(sessionId || null);
  const recorderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunkPathsRef = useRef<string[]>([]);

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
      const mapped = transcriptData.map(t => ({ time: t.timestamp, text: t.text }));
      setTranscripts(mapped);

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

    const loc = await getLocation();
    setLocation(loc || 'Location unavailable');

    try {
      const id = await createSession(fullTime, loc || 'Unknown');
      sessionIdRef.current = id;
      console.log('🆕 Session started with ID:', id);
    } catch (err) {
      console.error('Session creation failed:', err);
    }

    startChunkedRecording();
  };

  const getLocation = async (): Promise<string | null> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return null;
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            const components = data.results?.[0]?.address_components || [];
            const cityObj = components.find((c: any) =>
              c.types.includes('locality') || c.types.includes('administrative_area_level_2')
            );
            const stateObj = components.find((c: any) =>
              c.types.includes('administrative_area_level_1')
            );

            const city = cityObj?.long_name || 'Unknown';
            const state = stateObj?.short_name || 'Unknown';
            resolve(`${city}, ${state}`);
          } catch {
            resolve(null);
          }
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  };

  const startChunkedRecording = async () => {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) return;

    const startNewChunk = async () => {
      const fileName = `chunk_${Date.now()}.mp4`;
      const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
      const uri = await audioRecorderPlayer.startRecorder(path);

      recorderIntervalRef.current = setTimeout(async () => {
        await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();

        chunkPathsRef.current.push(uri);

        const realPath = uri.replace('file://', '');
        const exists = await RNFS.exists(realPath);

        if (exists) {
          const transcription = await transcribeAudioChunk(uri);
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          setTranscripts((prev) => [...prev, { time: timeStr, text: transcription }]);

          if (sessionIdRef.current) {
            await insertTranscript(sessionIdRef.current, timeStr, transcription);
          }
        }

        startNewChunk();
      }, 30000);

      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        return;
      });
    };

    startNewChunk();
  };

  const stopRecording = async () => {
    if (recorderIntervalRef.current) clearTimeout(recorderIntervalRef.current);
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordingStopped(true);
    setActiveTab('Notes');

    // Wait for transcript if it's not arrived yet
    let retries = 10;
    while (retries > 0 && transcripts.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries--;
    }

    const transcriptText = transcripts.map(t => t.text).join(' ').trim();
    if (!transcriptText) {
      setTitle('Untitled Session');
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
              content: 'Given the following transcript, return a concise and descriptive title (max 10 words) summarizing the meeting topic:',
            },
            {
              role: 'user',
              content: transcriptText,
            },
          ],
        }),
      });

      const data = await response.json();
      const generatedTitle = data.choices?.[0]?.message?.content?.trim();
      if (generatedTitle && generatedTitle.length > 3) {
        setTitle(generatedTitle);
      }
    } catch (err) {
      const fallback = transcriptText.split(/[.?!]/)[0]?.trim();
      if (fallback) setTitle(capitalize(fallback.slice(0, 60)));
    }
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
        return transcripts.length === 0 ? (
          <Text style={transcriptionStyles.placeholder}>No transcript available yet.</Text>
        ) : (
          <View>
            {transcripts.map((item, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', color: '#005B9E' }}>{item.time}</Text>
                <Text style={{ marginTop: 4 }}>{item.text}</Text>
              </View>
            ))}
            <Text style={{ marginTop: 12, fontSize: 12, color: 'gray', textAlign: 'center' }}>
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