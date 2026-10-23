import * as Sentry from '@sentry/nextjs';
import { Pool } from 'pg';

// Scalingo serves PostgreSQL behind a self-signed certificate, so we force `sslmode=no-verify`
// (otherwise `node-postgres` throws `SELF_SIGNED_CERT_IN_CHAIN`, whereas the former Prisma Rust engine was not verifying with `sslmode=prefer`)
const databaseUrl = (process.env.DATABASE_URL || '').replace('sslmode=prefer', 'sslmode=no-verify');

declare global {
  var dbPool: Pool | undefined;
}

// A single pool shared by Prisma and `pg-boss` to limit the number of connections (and the memory) of the container
export const dbPool =
  global.dbPool ||
  new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.DATABASE_POOL_MAX || 10),
    connectionTimeoutMillis: 10_000, // fail fast instead of waiting forever (was the `pg` default of `0`)
    idleTimeoutMillis: 30_000, // close idle connections ourselves before the server silently drops them
    keepAlive: true, // keep TCP alive to survive idle-connection killers in front of the database
  });

dbPool.on('error', (error) => {
  console.error(error);

  Sentry.captureException(error);
});

if (process.env.NODE_ENV !== 'production') global.dbPool = dbPool;
