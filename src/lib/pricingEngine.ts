export interface QuoteInput {
  teuPerYear: number;
  cifPerYear: number;
  shipmentsPerMonth: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface QuoteResult {
  retainer: number;
  variableRate: number;
  roi12m: number;
  paybackMonths: number;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  let retainer = 7000;
  if (input.teuPerYear > 100) retainer = 9000;
  if (input.teuPerYear > 300) retainer = 14000;

  if (input.complexity === 'medium') retainer *= 1.1;
  if (input.complexity === 'high') retainer *= 1.25;

  let variableRate = 1.0;
  if (input.teuPerYear > 200) variableRate = 0.8;

  const savings = input.cifPerYear * 0.05;
  const costYear = retainer * 12 + (savings * variableRate) / 100;
  const roi12m = Math.round(((savings - costYear) / costYear) * 100);
  const paybackMonths = Math.round(retainer / (savings / 12));

  return {
    retainer: Math.round(retainer),
    variableRate,
    roi12m,
    paybackMonths,
  };
} 