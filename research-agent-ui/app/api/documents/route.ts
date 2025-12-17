import { NextRequest, NextResponse } from 'next/server';

import { buildBackendHeaders } from '@/lib/backendHeaders';
import { getPythonBackendBaseUrl } from '@/lib/pythonBackend';

export async function GET(request: NextRequest) {
  try {
    const headers = await buildBackendHeaders();
    if (!headers) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') ?? '0';
    const limit = searchParams.get('limit') ?? '50';

    const backendBase = getPythonBackendBaseUrl();
    const response = await fetch(`${backendBase}/documents?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers,
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Document list error:', error);
    return NextResponse.json(
      {
        error: 'Unable to load documents',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
