"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const redirectTo =
      process.env.NEXT_PUBLIC_SITE_URL?.length
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
        : `${window.location.origin}/login`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (!error) setSent(true);
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.push('/admin/quote-incompany');
      }
    };

    checkUser();
  }, [router, supabase.auth]);

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Login</h1>
        {sent ? (
          <p>Verifique seu e-mail para o link mágico.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="w-full border px-3 py-2 rounded"
              placeholder="nome@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="w-full bg-slate-800 text-white py-2 rounded">Enviar link</button>
          </form>
        )}
      </div>
    </main>
  );
} 