import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from '@/lib/s3';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const s3 = new S3Storage('designs');
    const fileName = `${Date.now()}-${file.name}`;
    const url = await s3.uploadFile({
      file: buffer,
      fileName,
      contentType: file.type || 'application/octet-stream',
    });
    return NextResponse.json({ url,fileName });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 