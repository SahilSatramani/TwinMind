
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Geolocation from '@react-native-community/geolocation';
import RNFS from 'react-native-fs';
import { transcribeAudioChunk } from '../utils/transcribe';
import { GOOGLE_MAPS_API_KEY } from '@env';
import transcriptionStyles from '../styles/transcriptionStyles';
import TranscriptChatPanel from '../components/TranscriptChatPanel';
import QuestionsTab from '../components/QuestionTab';
import { createSession,insertTranscript } from '../db/database';
import NotesTab from '../components/NotesTab';


const audioRecorderPlayer = new AudioRecorderPlayer();
const TABS = ['Questions', 'Notes', 'Transcript'];

export default function TranscriptionScreen({ navigation }: any) {
  const [recordTime, setRecordTime] = useState('00:00');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState('Questions');
  const [transcripts, setTranscripts] = useState<{ time: string; text: string }[]>([]);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [recordingStopped, setRecordingStopped] = useState(false);
  const sessionIdRef = useRef<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullTime = `${dateStr} • ${timeStr}`;
    setStartTime(fullTime);

    getLocation().then((loc) => {
      setLocation(loc || 'Location unavailable');
      createSession(fullTime, loc || 'Unknown')
        .then((sessionId) => {
          sessionIdRef.current = sessionId;
          console.log('🆕 Session started with ID:', sessionId);
        })
        .catch((err) => console.error('Session creation failed:', err));
    });

    startChunkedRecording();
  }, []);

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

  const [audioChunks, setAudioChunks] = useState<string[]>([]);
  const chunkDuration = 30000;
  const chunkPathsRef = useRef<string[]>([]);
  const recorderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startChunkedRecording = async () => {
  const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (permission !== PermissionsAndroid.RESULTS.GRANTED) return;

  const startNewChunk = async () => {
    const fileName = `chunk_${Date.now()}.mp4`;
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
    const uri = await audioRecorderPlayer.startRecorder(path);

    recorderIntervalRef.current = setTimeout(async () => {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      chunkPathsRef.current.push(uri);
      setAudioChunks([...chunkPathsRef.current]);

      const realPath = uri.replace('file://', '');
      const exists = await RNFS.exists(realPath);

      if (exists) {
        const transcription = await transcribeAudioChunk(uri);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setTranscripts((prev) => [...prev, { time: timeStr, text: transcription }]);

        if (sessionIdRef.current) {
          try {
            await insertTranscript(sessionIdRef.current, timeStr, transcription);
            console.log('Transcript stored in DB:', transcription);
          } catch (err) {
            console.error('Failed to insert transcript into DB:', err);
          }
        }
      }

      startNewChunk();
    }, chunkDuration);

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
    setAudioChunks([...chunkPathsRef.current]);
    setRecordingStopped(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Questions':
        return (
          sessionIdRef.current ? (
          <QuestionsTab sessionId={sessionIdRef.current} />
        ) : (
        <Text style={transcriptionStyles.placeholder}>Session not ready yet...</Text>
      )
);
      case 'Notes':
  if (!recordingStopped) {
    return <Text style={transcriptionStyles.placeholder}>You can write your own notes!</Text>;
  } else if (sessionIdRef.current !== null) {
    return <NotesTab sessionId={sessionIdRef.current} />;
  } else {
    return <Text style={transcriptionStyles.placeholder}>Session not ready yet...</Text>;
  }
      case 'Transcript':
        return (
          <View>
            {transcripts.map((item, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: 'bold', color: '#005B9E' }}>{item.time}</Text>
                <Text style={{ marginTop: 4 }}>{item.text}</Text>
              </View>
            ))}
            <Text style={{ marginTop: 12, fontSize: 12, color: 'gray', textAlign: 'center' }}>
              Transcript is updated every 30s. <Text style={{ textDecorationLine: 'underline' }}>Update now</Text>
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={transcriptionStyles.container}>
      {/* Header */} 
      <View style={transcriptionStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={transcriptionStyles.back}>‹ Back</Text>
        </TouchableOpacity>
        <View style={transcriptionStyles.timerBadge}>
          <Text style={transcriptionStyles.timerText}>{recordTime}</Text>
        </View>
      </View>

      <Text style={transcriptionStyles.title}>Untitled</Text>
      <Text style={transcriptionStyles.subtitle}>
        {startTime} • {location}
      </Text>

      <View style={transcriptionStyles.notesPrompt}>
        <Text style={transcriptionStyles.notesText}>You can write your own notes!</Text>
        <TouchableOpacity style={transcriptionStyles.notesButton}>
          <Text style={{ fontWeight: 'bold' }}>Add Notes</Text>
        </TouchableOpacity>
      </View>

      <View style={transcriptionStyles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[transcriptionStyles.tabText, activeTab === tab && transcriptionStyles.activeTab]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={transcriptionStyles.content}>{renderTabContent()}</View>

      {showChatPanel ? (
  <TranscriptChatPanel
    onClose={() => setShowChatPanel(false)}
    transcript={transcripts.map(t => t.text).join('\n')}
    sessionId={sessionIdRef.current}
  />
) : (
  <View style={transcriptionStyles.bottomBar}>
    <TouchableOpacity style={transcriptionStyles.chatButton} onPress={() => setShowChatPanel(true)}>
      <Text style={transcriptionStyles.chatText}>Chat with Transcript</Text>
    </TouchableOpacity>
    <TouchableOpacity style={transcriptionStyles.stopButton} onPress={stopRecording}>
      <Text style={transcriptionStyles.stopText}>Stop</Text>
    </TouchableOpacity>
  </View>
)}
    </SafeAreaView>
  );
}