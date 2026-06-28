import DatabaseConstructor from 'better-sqlite3'
import { Database } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { commonLog } from '../utils/debug.js'

const DB_FOLDER = path.join(process.cwd(), 'data')
const DB_NAME = 'database.db'
const FULL_PATH = path.join(DB_FOLDER, DB_NAME)

const SCHEMA = `
CREATE TABLE IF NOT EXISTS task_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES task_plans(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'tool')),
    content TEXT,
    reasoning_content TEXT,
    tool_calls TEXT,
    tool_call_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS plan_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    step TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('todo', 'doing', 'done', 'failed')) DEFAULT 'todo',
    result TEXT,
    step_order INTEGER NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES task_plans(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_msg_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_step_plan ON plan_steps(plan_id);
`

export class DBManager {
  public db: Database
  constructor(dbPath: string = FULL_PATH) {
    if (!fs.existsSync(path.dirname(dbPath))) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true })
      commonLog(`📂 已创建数据库目录: ${path.dirname(dbPath)}`)
    }
    this.db = new DatabaseConstructor(dbPath)
    this.db.pragma('foreign_keys = ON')
    this.db.exec(SCHEMA)
    commonLog(`✅ 数据库就绪，路径: ${dbPath}`)
  }
}
export const dbManager = new DBManager()