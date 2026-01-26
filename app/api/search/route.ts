import { NextResponse } from 'next/server';
import { generateSearchIndex } from '@/lib/search';

export async function GET() {
  const index = generateSearchIndex();
  return NextResponse.json(index);
}
