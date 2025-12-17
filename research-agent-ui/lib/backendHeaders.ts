import 'server-only';
import { auth, currentUser } from '@clerk/nextjs/server';
export async function buildBackendHeaders(existing?: HeadersInit) {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  const serviceToken = process.env.BACKEND_SERVICE_TOKEN;
  if (!serviceToken) {
    throw new Error('BACKEND_SERVICE_TOKEN is not configured');
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

  const headers = new Headers(existing ?? {});
  headers.set('Authorization', `Bearer ${serviceToken}`);
  headers.set('X-User-Id', userId);
  if (email) {
    headers.set('X-User-Email', email);
  }

  return headers;
}
