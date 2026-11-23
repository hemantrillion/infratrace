import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Singleton instance to prevent multiple connections in Next.js hot reload
let databaseInstance: DatabaseSync | null = null;

export function getDatabaseConnection(): DatabaseSync {
  if (!databaseInstance) {
    let dbFilePath = path.join(process.cwd(), 'observatory_storage.db');

    // On Vercel or AWS Lambda serverless environments, the root directory is read-only.
    // Seed and use /tmp/observatory_storage.db so SQLite can safely read and write.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const tmpPath = path.join('/tmp', 'observatory_storage.db');
      if (!fs.existsSync(tmpPath)) {
        if (fs.existsSync(dbFilePath)) {
          try {
            fs.copyFileSync(dbFilePath, tmpPath);
          } catch (_) {
            // fallback if copy fails
          }
        }
      }
      dbFilePath = tmpPath;
    }

    databaseInstance = new DatabaseSync(dbFilePath);
  }
  return databaseInstance;
}
