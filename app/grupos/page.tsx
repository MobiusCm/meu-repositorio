'use client';

import { redirect } from 'next/navigation';

export default function GruposRedirect() {
  redirect('/groups');
  return null;
} 