import { ratios } from '@/lib/constants';

const ALLOWED_ASPECT_RATIOS = new Set(ratios.map((r) => r.apiSize));
const IMAGE_URL_PATTERN = /^(https?:\/\/|data:image\/(png|jpe?g|webp|gif);base64,)/i;

const MAX_PROMPT_LENGTH = 4000;
const MAX_IMAGE_URL_LENGTH = 15 * 1024 * 1024; // ~15MB, allows a sizeable base64 data URL
const MAX_USER_FILES = 6;

export type EditImageRequestData = {
  imageUrl: string;
  prompt: string;
  usersFiles: { url: string; mediaType?: string; filename?: string }[];
  aspectRatio?: string;
  maskImageUrl?: string;
};

export type ValidationResult =
  | { valid: true; data: EditImageRequestData }
  | { valid: false; error: string };

function isValidImageUrlString(value: unknown, maxLength: number): boolean {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= maxLength &&
    IMAGE_URL_PATTERN.test(value)
  );
}

export function validateEditImageRequest(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const { imageUrl, prompt, usersFiles, aspectRatio, maskImageUrl } =
    body as Record<string, unknown>;

  if (!isValidImageUrlString(imageUrl, MAX_IMAGE_URL_LENGTH)) {
    return {
      valid: false,
      error: 'imageUrl is required and must be a valid image URL or data URL.',
    };
  }

  if (
    typeof prompt !== 'string' ||
    prompt.trim().length === 0 ||
    prompt.length > MAX_PROMPT_LENGTH
  ) {
    return {
      valid: false,
      error: `prompt is required and must be a non-empty string of at most ${MAX_PROMPT_LENGTH} characters.`,
    };
  }

  if (maskImageUrl !== undefined && !isValidImageUrlString(maskImageUrl, MAX_IMAGE_URL_LENGTH)) {
    return { valid: false, error: 'maskImageUrl must be a valid image URL or data URL.' };
  }

  if (aspectRatio !== undefined) {
    if (typeof aspectRatio !== 'string' || !ALLOWED_ASPECT_RATIOS.has(aspectRatio)) {
      return { valid: false, error: 'aspectRatio must be one of the supported sizes.' };
    }
  }

  let normalizedUsersFiles: EditImageRequestData['usersFiles'] = [];
  if (usersFiles !== undefined) {
    if (!Array.isArray(usersFiles)) {
      return { valid: false, error: 'usersFiles must be an array.' };
    }
    if (usersFiles.length > MAX_USER_FILES) {
      return { valid: false, error: `usersFiles must contain at most ${MAX_USER_FILES} files.` };
    }
    for (const file of usersFiles) {
      if (
        typeof file !== 'object' ||
        file === null ||
        !isValidImageUrlString((file as Record<string, unknown>).url, MAX_IMAGE_URL_LENGTH)
      ) {
        return { valid: false, error: 'Each entry in usersFiles must have a valid image url.' };
      }
    }
    normalizedUsersFiles = usersFiles as EditImageRequestData['usersFiles'];
  }

  return {
    valid: true,
    data: {
      imageUrl: imageUrl as string,
      prompt: prompt as string,
      usersFiles: normalizedUsersFiles,
      aspectRatio: aspectRatio as string | undefined,
      maskImageUrl: maskImageUrl as string | undefined,
    },
  };
}
