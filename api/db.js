import { neon } from '@neondatabase/serverless';

export function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

export function getSqlClient() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}
