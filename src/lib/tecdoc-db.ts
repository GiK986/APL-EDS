import sql from 'mssql';

// Read-only TecDoc reference data (DT1xx tables) on the same MSSQL server as
// the other DB_* credentials, different database. Server-only — never import
// this from a Client Component.
let pool: Promise<sql.ConnectionPool> | undefined;

export function getTecDocPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    const database = process.env.TECDOC_DB_NAME;
    if (!host || !port || !user || !password || !database) {
      throw new Error('TecDoc DB env vars are not fully set (DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/TECDOC_DB_NAME)');
    }
    pool = new sql.ConnectionPool({
      server: host,
      port: Number(port),
      user,
      password,
      database,
      options: { encrypt: true, trustServerCertificate: true },
    }).connect();
  }
  return pool;
}
