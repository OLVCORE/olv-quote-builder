import { useEffect, useState } from 'react';

export type Currency = 'BRL' | 'USD' | 'EUR';

export function useRates(base: Currency = 'BRL') {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        setLoading(true);
        const res = await fetch(`https://api.exchangerate.host/latest?base=${base}`);
        const data = await res.json();
        setRates(data.rates || {});
      } catch (err) {
        setError('Falha ao obter câmbio');
      } finally {
        setLoading(false);
      }
    }
    fetchRates();
  }, [base]);

  return { rates, loading, error };
} 