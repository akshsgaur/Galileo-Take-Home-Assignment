import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

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
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000/research';

    const response = await fetch(pythonBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
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
