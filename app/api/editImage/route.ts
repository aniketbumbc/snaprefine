import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ResponseInputMessageContentList } from 'openai/resources/responses/responses';
import { getClientIp, rateLimit } from '@/lib/rateLimit';
import { validateEditImageRequest } from '@/lib/validateEditImageRequest';

const RATE_LIMIT = 1;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const MAX_REQUEST_BYTES = 20 * 1024 * 1024; // 20MB

/**
 *
 * @param request  Api call to llm with data
 * @returns
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, resetAt } = rateLimit(ip, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const validation = validateEditImageRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { imageUrl, prompt, usersFiles, aspectRatio, maskImageUrl } = validation.data;

  const structuredContent: ResponseInputMessageContentList = [];
  structuredContent.push(
    {
      type: 'input_text',
      text: prompt,
    },

    {
      type: 'input_image',
      image_url: imageUrl,
      detail: 'auto',
    },
  );

  if (maskImageUrl) {
    structuredContent.push({
      type: 'input_image',
      image_url: maskImageUrl,
      detail: 'auto',
    });
  }

  usersFiles.forEach((file) =>
    structuredContent.push({
      type: 'input_image',
      image_url: file.url,
      detail: 'auto',
    }),
  );
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set' },
      { status: 500 },
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let response;
  try {
    response = await openai.responses.create({
      model: 'gpt-5.5',
      input: [
        {
          role: 'user',
          content: structuredContent,
        },
      ],
      tools: [
        {
          type: 'image_generation',
          size: aspectRatio ? aspectRatio : undefined,
        },
      ],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to edit image',
      },
      { status: 500 },
    );
  }

  const imageData = response.output
    .filter((output: any) => output.type === 'image_generation_call')
    .map((output: any) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];
    return NextResponse.json({
      imageUrl: `data:image/png;base64,${imageBase64}`,
    });
  } else {
    console.log(response.output);
    return NextResponse.json({ error: 'No image data found' }, { status: 500 });
  }
}
