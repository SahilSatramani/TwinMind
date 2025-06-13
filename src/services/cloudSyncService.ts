import {
  fetchCloudSessions,
  fetchTranscriptsForSession,
  fetchSummaryForSession,
  fetchQuestionsForSession,
} from './cloudServiceSession';
import {
  createSession,
  insertTranscript,
  insertSummary,
  getDBConnection,
  insertQuestionAnswer
} from '../db/database';
import auth from '@react-native-firebase/auth';

export const syncSessionsFromCloud = async () => {
  const userEmail = auth().currentUser?.email ?? '';
  if (!userEmail) {
    console.warn('User email not available. Cannot sync sessions.');
    return;
  }

  const sessions = await fetchCloudSessions(userEmail);
  const db = await getDBConnection();

  for (const session of sessions) {
    try {
      const localSession = await db.executeSql(
        'SELECT id FROM sessions WHERE cloud_id = ?',
        [session.sessionId]
      );

      if (localSession[0].rows.length === 0) {
        const sessionId = await createSession(
          session.timestamp,
          session.location,
          session.sessionId.toString()
        );

        const transcripts = await fetchTranscriptsForSession(session.sessionId);
        for (const t of transcripts) {
          await insertTranscript(sessionId, t.time, t.text);
        }

        const summaryData = await fetchSummaryForSession(session.sessionId);
        if (summaryData?.summary) {
          await insertSummary(sessionId, summaryData.summary, summaryData.title);
        }

        const questions = await fetchQuestionsForSession(session.sessionId.toString());
        for (const q of questions) {
          await insertQuestionAnswer(sessionId, q.question, q.answer, q.timestamp);
        }

        console.log(`Session ${session.sessionId} synced successfully.`);
      }
    } catch (err) {
      console.error(`Error syncing session ${session.sessionId}:`, err);
    }
  }
};