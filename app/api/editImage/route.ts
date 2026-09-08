import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ResponseInputMessageContentList } from 'openai/resources/responses/responses';
/**
 *
 * @param request  Api call to llm with data
 * @returns
 */
export async function POST(request: Request) {
  const { imageUrl, prompt, usersFiles, aspectRatio, maskImageUrl } =
    await request.json();

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

  if (Array.isArray(usersFiles) && usersFiles?.length > 0) {
    usersFiles.forEach((file) =>
      structuredContent.push({
        type: 'input_image',
        image_url: file.url,
        detail: 'auto',
      }),
    );
  }
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
        error:
          error instanceof Error ? error.message : 'Failed to edit image',
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
    return NextResponse.json(
      { error: 'No image data found' },
      { status: 500 },
    );
  }
}
