import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prisma: PrismaClient | undefined;
}

const isServerlessRuntime = () =>
  Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.FUNCTIONS_WORKER_RUNTIME
  );

const getRuntimeConnectionString = () => {
  const fallback = 'postgres://postgres:password@localhost:5432/brgynexus';
  const rawConnectionString = isServerlessRuntime()
    ? process.env.DATABASE_URL || process.env.DIRECT_URL || fallback
    : process.env.DIRECT_URL || process.env.DATABASE_URL || fallback;

  try {
    const url = new URL(rawConnectionString);
    const isSupabaseHost =
      url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.pooler.supabase.com');

    if (isSupabaseHost) {
      url.searchParams.delete('sslmode');
      url.searchParams.set('ssl', 'no-verify');
    }

    return {
      connectionString: url.toString(),
      ssl: isSupabaseHost ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    return {
      connectionString: rawConnectionString,
      ssl: undefined,
    };
  }
};

const getPrismaClient = (): PrismaClient => {
  if (globalThis.prisma) {
    return globalThis.prisma;
  }

  const { connectionString, ssl } = getRuntimeConnectionString();
  const adapter = new PrismaPg({
    connectionString,
    ssl,
    max: process.env.NODE_ENV === 'production' ? 10 : 2, // limit local dev to 2 connections to avoid Supabase pool exhaustion
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  const prismaClient = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prismaClient;
  }

  return prismaClient;
};

const prisma = getPrismaClient();

export default prisma;
