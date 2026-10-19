import Database from 'better-sqlite3';
import path from 'path';
import bcryptjs from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data', 'inventory.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
try {
  mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
} catch (e) {}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS inventory_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      botox_variant TEXT,
      filler_type TEXT,
      units TEXT NOT NULL,
      quantity REAL NOT NULL,
      reorder_level REAL NOT NULL,
      cost_per_unit REAL NOT NULL,
      supplier TEXT,
      batch_number TEXT,
      expiration_date TEXT,
      notes TEXT,
      date_added TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      action TEXT NOT NULL,
      quantity REAL NOT NULL,
      reason TEXT,
      date TEXT NOT NULL,
      notes TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES inventory_products(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_type ON inventory_products(type);
    CREATE INDEX IF NOT EXISTS idx_logs_product ON inventory_logs(product_id);
    CREATE INDEX IF NOT EXISTS idx_logs_user ON inventory_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_logs_date ON inventory_logs(date);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
}

// User operations
export const userOps = {
  createUser: (username: string, email: string, password: string, role: string = 'viewer') => {
    const passwordHash = bcryptjs.hashSync(password, 10);
    try {
      const stmt = db.prepare(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
      );
      return stmt.run(username, email, passwordHash, role);
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  },

  getUserByUsername: (username: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as any;
  },

  verifyPassword: (password: string, hash: string) => {
    return bcryptjs.compareSync(password, hash);
  },

  updateLastLogin: (userId: number) => {
    const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(userId);
  },
};

// Session operations
export const sessionOps = {
  createSession: (userId: number, token: string, expiresAt: Date) => {
    const id = Date.now().toString();
    const stmt = db.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
    );
    return stmt.run(id, userId, token, expiresAt.toISOString());
  },

  getSessionByToken: (token: string) => {
    const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP');
    return stmt.get(token) as any;
  },

  deleteSession: (token: string) => {
    const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    return stmt.run(token);
  },

  cleanExpiredSessions: () => {
    const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP');
    return stmt.run();
  },
};

// Product operations
export const productOps = {
  getAllProducts: () => {
    const stmt = db.prepare('SELECT * FROM inventory_products ORDER BY date_added DESC');
    return stmt.all() as any[];
  },

  getProductById: (id: string) => {
    const stmt = db.prepare('SELECT * FROM inventory_products WHERE id = ?');
    return stmt.get(id) as any;
  },

  createProduct: (product: any) => {
    const stmt = db.prepare(`
      INSERT INTO inventory_products (
        id, name, type, botox_variant, filler_type, units, quantity,
        reorder_level, cost_per_unit, supplier, batch_number, expiration_date, notes, date_added
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      product.id,
      product.name,
      product.type,
      product.botoxVariant || null,
      product.fillerType || null,
      product.units,
      product.quantity,
      product.reorderLevel,
      product.costPerUnit,
      product.supplier,
      product.batchNumber || null,
      product.expirationDate || null,
      product.notes || null,
      product.dateAdded
    );
  },

  updateProduct: (id: string, updates: any) => {
    const fields = [];
    const values = [];

    const allowedFields = [
      'name',
      'type',
      'botox_variant',
      'filler_type',
      'units',
      'quantity',
      'reorder_level',
      'cost_per_unit',
      'supplier',
      'batch_number',
      'expiration_date',
      'notes',
    ];

    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key === 'botoxVariant' ? 'botox_variant' :
                    key === 'fillerType' ? 'filler_type' :
                    key === 'costPerUnit' ? 'cost_per_unit' :
                    key === 'reorderLevel' ? 'reorder_level' :
                    key === 'batchNumber' ? 'batch_number' :
                    key === 'expirationDate' ? 'expiration_date' : key;

      if (allowedFields.includes(dbKey)) {
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE inventory_products SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  },

  deleteProduct: (id: string) => {
    const stmt = db.prepare('DELETE FROM inventory_products WHERE id = ?');
    return stmt.run(id);
  },
};

// Log operations
export const logOps = {
  createLog: (log: any, userId?: number) => {
    const stmt = db.prepare(`
      INSERT INTO inventory_logs (id, product_id, action, quantity, reason, date, notes, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      log.id,
      log.productId,
      log.action,
      log.quantity,
      log.reason || null,
      log.date,
      log.notes || null,
      userId || null
    );
  },

  getLogsByProduct: (productId: string) => {
    const stmt = db.prepare(
      'SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY date DESC'
    );
    return stmt.all(productId) as any[];
  },

  getAllLogs: (limit: number = 100) => {
    const stmt = db.prepare(
      'SELECT * FROM inventory_logs ORDER BY date DESC LIMIT ?'
    );
    return stmt.all(limit) as any[];
  },
};

export default db;
