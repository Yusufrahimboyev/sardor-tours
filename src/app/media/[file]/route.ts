import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MEDIA_NAME_RE, mimeFor, UPLOAD_DIR } from '@/lib/server/media';

/** Serves photos uploaded in the admin panel. File names are random and immutable. */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!MEDIA_NAME_RE.test(file)) return new Response('Not found', { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        'Content-Type': mimeFor(file),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
