import { NextRequest, NextResponse } from 'next/server';

import { getPythonBackendBaseUrl } from '@/lib/pythonBackend';
import { buildBackendHeaders } from '@/lib/backendHeaders';

const RELATIVE_PATH = '/research';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, ...rest } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Call the Python backend
    // You can either:
    // 1. Call the Python agent directly if running as a service
    // 2. Use a child_process to run the Python script
    // 3. Have a separate Python API server

    // For now, we'll call a Python API endpoint (you'll need to create this)
    const headers = await buildBackendHeaders({ 'Content-Type': 'application/json' });
    if (!headers) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendBase = getPythonBackendBaseUrl();
    const response = await fetch(`${backendBase}${RELATIVE_PATH}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ question, ...rest }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Research failed', details: payload },
        { status: response.status }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('API error:', error);

    return NextResponse.json(
      {
        error: 'Research failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
