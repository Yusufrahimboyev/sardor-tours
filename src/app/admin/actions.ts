'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkPassword, endSession, requireAdmin, startSession } from '@/lib/server/auth';
import { rateLimited } from '@/lib/server/http';
import { BOOKING_STATUSES, bookings, messages, type BookingStatus } from '@/lib/server/store';

export interface LoginState {
  error?: string;
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const req = new Request('http://admin.local/login', { headers: await headers() });
  if (rateLimited(req, 'admin-login', 5)) return { error: 'Juda ko‘p urinish. Bir daqiqa kutib, qayta urinib ko‘ring.' };
  if (!checkPassword(String(form.get('password') ?? ''))) return { error: 'Parol noto‘g‘ri.' };
  await startSession();
  redirect('/admin/');
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/admin/login/');
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await requireAdmin();
  if (!BOOKING_STATUSES.includes(status)) return;
  await bookings.update(id, { status, updatedAt: new Date().toISOString() });
  revalidatePath('/admin', 'layout');
}

export async function saveBookingNote(id: string, form: FormData): Promise<void> {
  await requireAdmin();
  const note = String(form.get('note') ?? '').slice(0, 2000);
  await bookings.update(id, { adminNote: note, updatedAt: new Date().toISOString() });
  revalidatePath(`/admin/bookings/${id}/`);
}

export async function setMessageRead(id: string, read: boolean): Promise<void> {
  await requireAdmin();
  await messages.update(id, { read });
  revalidatePath('/admin', 'layout');
}
