import firestore from '@react-native-firebase/firestore';

export const sessionsCollection = firestore().collection('sessions');
export const transcriptsCollection = firestore().collection('transcripts');
export const questionsCollection = firestore().collection('questions');
export const summariesCollection = firestore().collection('summaries');

export { firestore };