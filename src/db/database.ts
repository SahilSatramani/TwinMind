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


  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS summaries (
      session_id INTEGER PRIMARY KEY,
      summary TEXT,
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
  summary: string
) => {
  const db = await getDBConnection();
  await db.executeSql(
    `INSERT OR REPLACE INTO summaries (session_id, summary) VALUES (?, ?)`,
    [sessionId, summary]
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