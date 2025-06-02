import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { OPENAI_API_KEY } from '@env';

export const transcribeAudioChunk = async (fileUri: string): Promise<string> => {
  try {
    const cleanedUri = Platform.OS === 'android'
      ? fileUri.replace('file://', '')
      : fileUri;

    const fileInfo = await RNFS.stat(cleanedUri);
    console.log('🔊 Transcribing:', fileUri, '| Size:', fileInfo.size);

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: 'audio.mp4',
      type: 'audio/mp4',
    } as any);
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('API Error:', response.status);
      return 'Transcription failed';
    }

    const result = await response.json();
    console.log('Transcription:', result.text);
    return result.text;

  } catch (err: any) {
    console.error('Transcription failed:', err.message);
    return 'Transcription failed';
  }
};