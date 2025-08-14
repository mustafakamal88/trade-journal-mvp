// src/lib/session.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSessionSafe() {
  try {
    return await getServerSession(authOptions);
  } catch (e) {
    console.error('getServerSession failed in server component:', e);
    return null;
  }
}
