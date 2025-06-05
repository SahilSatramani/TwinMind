// services/qaStorageService.ts
import { insertQuestionAnswer } from '../db/database';

export const saveQuestionAnswer = async (
  sessionId: number | null,
  question: string,
  answer: string
) => {
  if (!sessionId) return;
  const timestamp = new Date().toISOString();
  try {
    await insertQuestionAnswer(sessionId, question, answer, timestamp);
    console.log('stored in DB:', { question, answer });
  } catch (err) {
    console.error('Failed to store Q&A:', err);
  }
};