import { NextRequest, NextResponse } from 'next/server';

import { buildBackendHeaders } from '@/lib/backendHeaders';
import { getPythonBackendBaseUrl } from '@/lib/pythonBackend';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const documentId = params.id;

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
  }

  try {
    const headers = await buildBackendHeaders();
    if (!headers) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendBase = getPythonBackendBaseUrl();
    const response = await fetch(`${backendBase}/documents/${documentId}`, {
      method: 'DELETE',
      headers,
    });

    const payload = await response.json();
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json(
      {
        error: 'Document delete failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
