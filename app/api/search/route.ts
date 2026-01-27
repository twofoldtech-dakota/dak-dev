import { NextResponse } from 'next/server';
import { generateSearchIndex } from '@/lib/search/index-generator';

export async function GET() {
  const index = generateSearchIndex();
  return NextResponse.json(index);
}
