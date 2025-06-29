import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/admin/quote-incompany');
  return null;
} 