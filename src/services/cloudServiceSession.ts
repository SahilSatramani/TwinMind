// src/services/cloudServices.ts
import { sessionsCollection, transcriptsCollection,firestore } from './firestore';
import { createSession,getDBConnection } from '../db/database';

export const createCloudSession = async (
  sessionId: string,
  title: string,
  location: string,
  timestamp: string
) => {
  try {
    await sessionsCollection.doc(sessionId.toString()).set({
      sessionId,
      title,
      location,
      timestamp,
    });
    console.log('Cloud session stored successfully');
  } catch (err) {
    console.error('Failed to create session in Firestore:', err);
  }
};

export const saveTranscriptChunkToCloud = async (
  sessionId: string,
  time: string,
  text: string
) => {
  try {
    const transcriptRef = firestore()
      .collection('sessions')
      .doc(sessionId.toString())
      .collection('transcripts');

    await transcriptRef.add({
      time,
      text,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('Transcript chunk saved to cloud');
  } catch (err) {
    console.error('Failed to save transcript chunk to cloud:', err);
  }
};
export const saveSummaryToCloud = async (
  sessionId: string,
  summary: string,
  title: string
) => {
  try {
    await firestore()
      .collection('sessions')
      .doc(sessionId.toString())
      .update({
        summary,
        title,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    console.log('Summary saved to cloud');
  } catch (err) {
    console.error('Failed to save summary to Firestore:', err);
  }
};
export const saveQuestionAnswerToCloud = async (
  sessionId: string,
  question: string,
  answer: string
) => {
  try {
    await firestore()
      .collection('sessions')
      .doc(sessionId.toString())
      .collection('questions')
      .add({
        question,
        answer,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    console.log('Q&A saved to cloud');
  } catch (err) {
    console.error('Failed to save Q&A to Firestore:', err);
  }
};


// Fetch all sessions from the cloud
// This function retrieves all sessions from the Firestore database
type CloudSession = {
  sessionId: number; // sessionId can be a string or number based on your Firestore setup
  title: string;
  location: string;
  timestamp: string;
};

export const fetchCloudSessions = async (): Promise<CloudSession[]> => {
  try {
    const snapshot = await firestore().collection('sessions').get();
    const sessions: CloudSession[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sessionId: parseInt(doc.id),
        title: data.title || '',
        location: data.location || '',
        timestamp: data.timestamp || '',
      };
    });
    return sessions;
  } catch (err) {
    console.error('Error fetching cloud sessions:', err);
    return [];
  }
};
export const fetchTranscriptsForSession = async (sessionId: number) => {
  try {
    const snapshot = await firestore()
      .collection('sessions')
      .doc(sessionId.toString())
      .collection('transcripts')
      .orderBy('createdAt')
      .get();

    return snapshot.docs.map(doc => ({
      time: doc.data().time || '',
      text: doc.data().text || '',
    }));
  } catch (err) {
    console.error(`Failed to fetch transcripts for session ${sessionId}:`, err);
    return [];
  }
};

export const fetchSummaryForSession = async (sessionId: number) => {
  try {
    const doc = await firestore().collection('sessions').doc(sessionId.toString()).get();
    const data = doc.data();
    return {
      summary: data?.summary || '',
      title: data?.title || '',
    };
  } catch (err) {
    console.error(`Failed to fetch summary for session ${sessionId}:`, err);
    return null;
  }
};

// In cloudServiceSession.ts
export const fetchQuestionsForSession = async (sessionId: string) => {
  try {
    const snapshot = await firestore()
      .collection('sessions')
      .doc(sessionId.toString())
      .collection('questions')
      .orderBy('createdAt')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.createdAt?.toDate().toISOString() || new Date().toISOString();
      return {
        question: data.question || '',
        answer: data.answer || '',
        timestamp,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch Q&A for session ${sessionId}:`, err);
    return [];
  }
};