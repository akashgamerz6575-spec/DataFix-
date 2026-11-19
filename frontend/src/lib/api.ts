import type { DatasetProfile } from './contract-types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export interface ApiHealthResponse {
  status: string;
  service: string;
  environment: string;
}

/**
 * Checks backend health endpoint with a short abort timeout
 */
export async function checkApiHealth(): Promise<{ online: boolean; waking: boolean; data?: ApiHealthResponse }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = (await response.json()) as ApiHealthResponse;
      return { online: true, waking: false, data };
    }
    return { online: false, waking: false };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { online: false, waking: true };
    }
    return { online: false, waking: false };
  }
}

/**
 * Uploads a CSV to the profiling endpoint
 */
export async function profileDataset(file: File): Promise<DatasetProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/datasets/profile`, {
    method: 'POST',
    body: formData,
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    let message = 'The dataset could not be profiled.';
    if (typeof body.detail === 'string') {
      message = body.detail;
    } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      message = body.detail[0].msg;
    }
    throw new Error(message);
  }

  return body.profile as DatasetProfile;
}

export { API_BASE_URL };
