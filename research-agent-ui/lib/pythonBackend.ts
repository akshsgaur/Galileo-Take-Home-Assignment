export function getPythonBackendBaseUrl() {
  if (process.env.PYTHON_BACKEND_BASE_URL) {
    return process.env.PYTHON_BACKEND_BASE_URL;
  }

  const researchUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000/research';
  try {
    const parsed = new URL(researchUrl);
    return parsed.origin;
  } catch {
    return 'http://localhost:8000';
  }
}
