import { generateSearchIndex, searchPosts } from '@/lib/search';

// Generate the search index
const index = generateSearchIndex();

console.log('Generated search index:');
console.log(`Total posts indexed: ${index.length}`);
console.log('');

if (index.length > 0) {
  console.log('Sample index item:');
  console.log(JSON.stringify(index[0], null, 2));
  console.log('');

  // Test search functionality
  console.log('Testing search with query "AI":');
  const results = searchPosts(index, 'AI');
  console.log(`Found ${results.length} results`);
  results.forEach((result) => {
    console.log(`- ${result.title} (${result.slug})`);
  });
}

// Measure size
const jsonSize = Buffer.from(JSON.stringify(index)).length;
const gzipEstimate = Math.round(jsonSize * 0.3); // Rough estimate

console.log('');
console.log(`Index size: ${(jsonSize / 1024).toFixed(2)} KB`);
console.log(`Estimated gzipped size: ${(gzipEstimate / 1024).toFixed(2)} KB`);
