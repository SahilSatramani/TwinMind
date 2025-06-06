import { useEffect, useRef, useState } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';
import { transcribeAudioChunk } from '../utils/transcribe';
import { insertTranscript, getCloudIdBySessionId } from '../db/database';
import { saveTranscriptChunkToCloud } from '../services/cloudServiceSession';

const audioRecorderPlayer = new AudioRecorderPlayer();

export const useAudioRecorder = (getSessionId: () => number | null) => {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [transcripts, setTranscripts] = useState<{ time: string; text: string }[]>([]);
  const [sessionStartTimestamp, setSessionStartTimestamp] = useState(Date.now());

  const recorderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recorderIntervalRef.current) clearTimeout(recorderIntervalRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startRecording = async () => {
    const permissionGranted = await requestAudioPermission();
    if (!permissionGranted) return;

    const now = Date.now();
    setSessionStartTimestamp(now);
    recordingStartRef.current = now;

    // Start elapsed time ticker
    totalTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - (recordingStartRef.current || Date.now());
      const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);

    startNewChunk();
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
            const cloudId = await getCloudIdBySessionId(currentSessionId);
            if (cloudId) {
              await saveTranscriptChunkToCloud(cloudId, timeStr, transcription);
            }
          } catch (err) {
            console.error('Failed to insert transcript:', err);
          }
        }
      }

      startNewChunk(); // Start next chunk after 30s
    }, 30000);
  };

  const stopRecording = async () => {
    if (recorderIntervalRef.current) clearTimeout(recorderIntervalRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  };

  return {
    recordTime: elapsedTime,
    transcripts,
    sessionStartTimestamp,
    startRecording,
    stopRecording,
  };
};