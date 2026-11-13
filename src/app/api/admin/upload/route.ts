import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/server/auth';
import { jsonError, rateLimited } from '@/lib/server/http';
import { saveUpload } from '@/lib/server/media';
import { getAdminDict } from '@/app/admin/i18n/server';

/** POST multipart "files" (one or more) → { paths, errors }. Admin session required. */
export async function POST(req: Request) {
  if (!(await isAdminSession())) return jsonError(401, 'Unauthorized');
  if (rateLimited(req, 'upload', 60)) return jsonError(429, 'Too many uploads, wait a minute.');
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(400, 'Expected multipart form data');
  }
  const files = form.getAll('files').filter((f): f is File => f instanceof File).slice(0, 20);
  const paths: string[] = [];
  const errors: string[] = [];
  const msg = (await getAdminDict()).upload;
  for (const f of files) {
    const r = await saveUpload(f, msg);
    if ('path' in r) paths.push(r.path);
    else errors.push(r.error);
  }
  return NextResponse.json({ ok: true, paths, errors });
}
