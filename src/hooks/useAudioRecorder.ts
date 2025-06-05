import { useEffect, useRef, useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';
import { transcribeAudioChunk } from '../utils/transcribe';
import { insertTranscript } from '../db/database';

const audioRecorderPlayer = new AudioRecorderPlayer();

export const useAudioRecorder = (getSessionId: ()=>number | null) => {
  const [recordTime, setRecordTime] = useState('00:00');
  const [transcripts, setTranscripts] = useState<{ time: string; text: string }[]>([]);
  const [sessionStartTimestamp, setSessionStartTimestamp] = useState(Date.now());

  const recorderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recorderIntervalRef.current) clearTimeout(recorderIntervalRef.current);
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const startRecording = async () => {
    const permissionGranted = await requestAudioPermission();
    if (!permissionGranted) return;

    setSessionStartTimestamp(Date.now());
    startNewChunk();
  };

  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startNewChunk = async () => {
    const fileName = `chunk_${Date.now()}.mp4`;
    const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
    const uri = await audioRecorderPlayer.startRecorder(path);

    recorderIntervalRef.current = setTimeout(async () => {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      const realPath = uri.replace('file://', '');
      const exists = await RNFS.exists(realPath);

      if (exists) {
        const transcription = await transcribeAudioChunk(uri);
        const timeStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        setTranscripts((prev) => [...prev, { time: timeStr, text: transcription }]);
        const currentSessionId = getSessionId();
if (currentSessionId) {
  try {
    await insertTranscript(currentSessionId, timeStr, transcription);
  } catch (err) {
    console.error('Failed to insert transcript:', err);
  }
}
      }

      startNewChunk();
    }, 30000);

    audioRecorderPlayer.addRecordBackListener((e) => {
      const millis = Math.floor(e.currentPosition);
      const minutes = Math.floor(millis / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((millis % 60000) / 1000).toString().padStart(2, '0');
      setRecordTime(`${minutes}:${seconds}`);
      return;
    });
  };

  const stopRecording = async () => {
    if (recorderIntervalRef.current) clearTimeout(recorderIntervalRef.current);
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  };

  return {
    recordTime,
    transcripts,
    sessionStartTimestamp,
    startRecording,
    stopRecording,
  };
};