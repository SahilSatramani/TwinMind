import SQLite from 'react-native-sqlite-storage';
import { format } from 'date-fns';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
  return SQLite.openDatabase({ name: 'twinmind.db', location: 'default' });
};

export const initDatabase = async () => {
  const db = await getDBConnection();

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time TEXT,
      location TEXT
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS transcripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      timestamp TEXT,
      text TEXT,
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      question TEXT,
      answer TEXT,
      timestamp TEXT,
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    );
  `);

  // Create summaries table (if not exists)
  await db.executeSql(`
  CREATE TABLE IF NOT EXISTS summaries (
    session_id INTEGER PRIMARY KEY,
    summary TEXT,
    title TEXT,
    FOREIGN KEY(session_id) REFERENCES sessions(id)
  );
`);
};

export const createSession = async (startTime: string, location: string): Promise<number> => {
  const db = await getDBConnection();
  const result = await db.executeSql(
    `INSERT INTO sessions (start_time, location) VALUES (?, ?);`,
    [startTime, location]
  );
  return result[0].insertId!;
};

export const insertTranscript = async (
  sessionId: number,
  timestamp: string,
  text: string
) => {
  const db = await getDBConnection();
  await db.executeSql(
    `INSERT INTO transcripts (session_id, timestamp, text) VALUES (?, ?, ?)`,
    [sessionId, timestamp, text]
  );
};

export const insertQuestionAnswer = async (
  sessionId: number,
  question: string,
  answer: string,
  timestamp: string
) => {
  const db = await getDBConnection();
  await db.executeSql(
    `INSERT INTO questions (session_id, question, answer, timestamp) VALUES (?, ?, ?, ?)`,
    [sessionId, question, answer, timestamp]
  );
};

export const getQuestionsBySession = async (sessionId: number) => {
  const db = await getDBConnection();
  const results = await db.executeSql(
    `SELECT id, question, answer FROM questions WHERE session_id = ? ORDER BY id DESC`,
    [sessionId]
  );
  return results[0].rows.raw(); // array of { id, question, answer }
};

export const insertSummary = async (
  sessionId: number,
  summary: string,
  title?: string
) => {
  const db = await getDBConnection();
  await db.executeSql(
  `INSERT OR REPLACE INTO summaries (session_id, summary, title) VALUES (?, ?, ?)`,
  [sessionId, summary, title || null]
);
};

export const getSummaryBySession = async (sessionId: number): Promise<string | null> => {
  const db = await getDBConnection();
  const result = await db.executeSql(
    `SELECT summary FROM summaries WHERE session_id = ?`,
    [sessionId]
  );
  const rows = result[0].rows;
  return rows.length > 0 ? rows.item(0).summary : null;
};

export const getSummaryWithTitleBySession = async (
  sessionId: number
): Promise<{ summary: string; title: string } | null> => {
  const db = await getDBConnection();
  const result = await db.executeSql(
    `SELECT summary, title FROM summaries WHERE session_id = ?`,
    [sessionId]
  );
  const rows = result[0].rows;
  if (rows.length > 0) {
    const item = rows.item(0);
    return { summary: item.summary, title: item.title };
  }
  return null;
};

export const getTranscriptsBySession = async (
  sessionId: number
): Promise<{ timestamp: string; text: string }[]> => {
  const db = await getDBConnection();
  const result = await db.executeSql(
    `SELECT timestamp, text FROM transcripts WHERE session_id = ?`,
    [sessionId]
  );
  return result[0].rows.raw();
};
export const getAllSessionsWithTitles = async () => {
  const db = await getDBConnection();
  const result = await db.executeSql(`
    SELECT s.id, s.start_time, s.location, sm.title
    FROM sessions s
    LEFT JOIN summaries sm ON s.id = sm.session_id
    ORDER BY s.start_time DESC;
  `);
  const sessions = result[0].rows.raw();
  console.log('Sessions fetched from DB:', sessions);
  return sessions;
}
export const getAllQuestionsGrouped = async () => {
  const db = await getDBConnection();
  const result = await db.executeSql(
    `SELECT id, question, answer, timestamp FROM questions ORDER BY timestamp DESC`
  );
  const rows = result[0].rows.raw();

  return rows.reduce((acc: any, row: any) => {
    const dateKey = format(new Date(row.timestamp), 'EEE, MMM d');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(row);
    return acc;
  }, {});
};