import SQLite from 'react-native-sqlite-storage';

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