import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

/**
 * Uploaded photos (admin panel). Stored in DATA_DIR/uploads and served by
 * /media/[file]. Swap for object storage (S3, Vercel Blob…) on serverless hosting.
 */
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), '.data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

const TYPES = [
  { ext: 'jpg', mime: 'image/jpeg', test: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', mime: 'image/png', test: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'webp', mime: 'image/webp', test: (b: Buffer) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { ext: 'mp4', mime: 'video/mp4', test: (b: Buffer) => b.toString('ascii', 4, 8) === 'ftyp' },
] as const;

export const MEDIA_NAME_RE = /^[a-z0-9]{16}\.(jpg|png|webp|mp4)$/;

export function mimeFor(name: string): string {
  return TYPES.find((t) => name.endsWith(`.${t.ext}`))?.mime ?? 'application/octet-stream';
}

/** Validates by content (not by the client-supplied type) and returns the public path. */
export interface UploadMessages {
  empty: string;
  videoTooBig: string;
  badType: string;
  imageTooBig: string;
}

const DEFAULT_MESSAGES: UploadMessages = {
  empty: 'empty file',
  videoTooBig: 'larger than 60 MB',
  badType: 'only JPG, PNG, WebP images or MP4 video',
  imageTooBig: 'image larger than 8 MB',
};

export async function saveUpload(file: File, msg: UploadMessages = DEFAULT_MESSAGES): Promise<{ path: string } | { error: string }> {
  if (file.size === 0) return { error: `${file.name}: ${msg.empty}` };
  if (file.size > MAX_VIDEO_BYTES) return { error: `${file.name}: ${msg.videoTooBig}` };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = TYPES.find((t) => t.test(buf));
  if (!type) return { error: `${file.name}: ${msg.badType}` };
  if (type.ext !== 'mp4' && file.size > MAX_UPLOAD_BYTES) return { error: `${file.name}: ${msg.imageTooBig}` };
  const name = `${randomBytes(8).toString('hex')}.${type.ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return { path: `/media/${name}` };
}
