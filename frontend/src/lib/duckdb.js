import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdb_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";

const PARQUET_FILES = ["standings", "results", "laps", "stints"];
const PARQUET_BASE =
  "https://huggingface.co/datasets/Aman2406/f1-visual-analytics/resolve/main/data";

let dbInstance = null;
let connInstance = null;
let initPromise = null;

async function initDB() {
  const worker = new Worker(duckdb_worker);
  const logger = new duckdb.ConsoleLogger();
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(duckdb_wasm);

  // Fetch parquet files from HF and register in DuckDB's virtual filesystem
  for (const name of PARQUET_FILES) {
    const resp = await fetch(`${PARQUET_BASE}/${name}.parquet`);
    const buf = new Uint8Array(await resp.arrayBuffer());
    await db.registerFileBuffer(`${name}.parquet`, buf);
  }

  const conn = await db.connect();

  // Create SQL views over registered files
  for (const name of PARQUET_FILES) {
    await conn.query(
      `CREATE VIEW ${name} AS SELECT * FROM read_parquet('${name}.parquet')`
    );
  }

  dbInstance = db;
  connInstance = conn;
  return conn;
}

/**
 * Returns a singleton DuckDB connection.
 * Safe to call multiple times — only initializes once.
 */
export async function getConnection() {
  if (connInstance) return connInstance;
  if (!initPromise) {
    initPromise = initDB();
  }
  return initPromise;
}

/**
 * Execute a SQL query and return results as a plain JS array of objects.
 */
export async function query(sql) {
  const conn = await getConnection();
  const result = await conn.query(sql);
  return result.toArray().map((row) => ({ ...row }));
}
