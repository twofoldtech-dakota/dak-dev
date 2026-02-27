export async function register() {
  if (process.env.NODE_ENV === 'development') {
    const { getHighlighterInstance } = await import('./lib/shiki-highlighter');
    await getHighlighterInstance();
  }
}
