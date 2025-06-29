import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote, QuoteInput } from '@/lib/pricingEngine';

export async function POST(request: NextRequest) {
  const data = (await request.json()) as QuoteInput;
  const result = calculateQuote(data);
  return NextResponse.json(result);
} 