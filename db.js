import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, 'database.json');
const adapter = new JSONFile(file);
const defaultData = { users: [], rooms: [] };
const db = new Low(adapter, defaultData);

await db.read();
await db.write();

export default db;