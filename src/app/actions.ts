'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthService from '@/services/auth';

export async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const authService = new AuthService();

  if (!token) {
    return redirect(`/login`);
  }

  try {
    return await authService.getUserProfile(String(token));
  } catch (e) {
    console.log('getUserInfo error', e);
    redirect(`/login`);
  }
}
