import { NextRequest, NextResponse } from 'next/server';

import { buildBackendHeaders } from '@/lib/backendHeaders';
import { getPythonBackendBaseUrl } from '@/lib/pythonBackend';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const headers = await buildBackendHeaders();
    if (!headers) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendBase = getPythonBackendBaseUrl();
    const response = await fetch(`${backendBase}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      {
        error: 'Document upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
