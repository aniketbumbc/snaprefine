import { FileUIPart } from 'ai';

type EditImageParams = {
  imageUrl: string | null;
  prompt: string;
  usersFiles?: FileUIPart[];
  aspectRatio?: string;
  maskImageUrl?: string;
};

type EditImageResponse = {
  imageUrl: string;
};

export class ApiError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export async function editImage(
  params: EditImageParams,
): Promise<EditImageResponse> {
  const response = await fetch('/api/editImage', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const retryAfterHeader = response.headers.get('Retry-After');
    throw new ApiError(
      body?.error || 'Failed to edit image',
      response.status,
      retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined,
    );
  }
  return response.json();
}
