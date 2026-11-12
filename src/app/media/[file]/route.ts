import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MEDIA_NAME_RE, mimeFor, UPLOAD_DIR } from '@/lib/server/media';

/** Serves photos/videos uploaded in the admin panel. File names are random and immutable. Supports Range (video seeking, Safari). */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!MEDIA_NAME_RE.test(file)) return new Response('Not found', { status: 404 });
  let data: Buffer;
  try {
    data = await fs.readFile(path.join(UPLOAD_DIR, file));
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const headers: Record<string, string> = {
    'Content-Type': mimeFor(file),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
  };
  const range = req.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const size = data.length;
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    return new Response(new Uint8Array(data.subarray(start, end + 1)), {
      status: 206,
      headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) },
    });
  }
  return new Response(new Uint8Array(data), { headers: { ...headers, 'Content-Length': String(data.length) } });
}
