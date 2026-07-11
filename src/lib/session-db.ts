import sql from 'mssql';

const SID_LOOKUP_QUERY = `
  SELECT 1 AS ok FROM dbo.V_EXT_APL_EDS_SESSIONS
  WHERE SESSION_ID = @sid AND LAST_LOGIN >= DATEADD(HOUR, -8, GETDATE())
`;

const CONNECTION_TIMEOUT_MS = 5000;

let pool: Promise<sql.ConnectionPool> | undefined;

function getConfig(): sql.config {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('DB_HOST, DB_USER, DB_PASSWORD and DB_NAME must be set');
  }

  return {
    server: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 1433,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionTimeout: CONNECTION_TIMEOUT_MS,
    requestTimeout: CONNECTION_TIMEOUT_MS,
    options: { encrypt: false, trustServerCertificate: true },
  };
}

function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(getConfig()).connect();
  }
  return pool;
}

export async function validateSid(sid: string): Promise<boolean> {
  try {
    const connection = await getPool();
    const result = await connection.request().input('sid', sql.VarChar, sid).query(SID_LOOKUP_QUERY);
    return result.recordset.length > 0;
  } catch (err) {
    console.error('validateSid failed:', err);
    pool?.then((p) => p.close()).catch(() => {});
    pool = undefined;
    return false;
  }
}
