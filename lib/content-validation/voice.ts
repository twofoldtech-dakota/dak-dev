/**
 * Brand voice validation
 */

import type { ValidationResult, ValidationIssue } from './types';
import { loadGuidelines } from './guidelines';

/**
 * Validate content against brand voice guidelines
 */
export function validateBrandVoice(content: string): ValidationResult {
  const guidelines = loadGuidelines();
  const rules = guidelines.validation_rules.tone;
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Remove code blocks for text analysis
  const textContent = content.replace(/```[\s\S]*?```/g, '');

  // Check forbidden phrases
  for (const phrase of rules.forbidden_phrases) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = textContent.match(regex);
    if (matches) {
      warnings.push({
        type: 'warning',
        category: 'voice',
        message: `Forbidden phrase found: "${phrase}" (${matches.length}x)`,
        suggestion: 'Replace with more direct, confident language',
      });
    }
  }

  // Passive voice detection (simplified)
  const passivePatterns = [
    /\b(was|were|been|being)\s+\w+ed\b/gi,
    /\b(is|are)\s+being\s+\w+ed\b/gi,
    /\b(has|have|had)\s+been\s+\w+ed\b/gi,
  ];

  let passiveCount = 0;
  for (const pattern of passivePatterns) {
    const matches = textContent.match(pattern);
    if (matches) {
      passiveCount += matches.length;
    }
  }

  // Calculate sentences
  const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const passiveVoicePercentage = sentenceCount > 0 ? (passiveCount / sentenceCount) * 100 : 0;

  if (passiveVoicePercentage > rules.max_passive_voice_percentage) {
    warnings.push({
      type: 'warning',
      category: 'voice',
      message: `High passive voice usage: ${passiveVoicePercentage.toFixed(1)}% (max: ${rules.max_passive_voice_percentage}%)`,
      suggestion: 'Convert passive sentences to active voice',
    });
  }

  // Sentence length analysis
  let longSentenceCount = 0;
  let totalWords = 0;
  for (const sentence of sentences) {
    const wordCount = sentence.trim().split(/\s+/).length;
    totalWords += wordCount;
    if (wordCount > rules.max_sentence_length) {
      longSentenceCount++;
    }
  }

  const avgSentenceLength = sentenceCount > 0 ? totalWords / sentenceCount : 0;

  if (longSentenceCount > 3) {
    warnings.push({
      type: 'warning',
      category: 'voice',
      message: `${longSentenceCount} sentences exceed ${rules.max_sentence_length} words`,
      suggestion: 'Break long sentences into shorter, clearer ones',
    });
  }

  const passed = issues.length === 0;
  const score = Math.max(0, 100 - issues.length * 15 - warnings.length * 5);

  return {
    passed,
    score,
    issues,
    warnings,
    metrics: {
      wordCount: 0,
      headingCount: 0,
      codeBlockCount: 0,
      passiveVoicePercentage,
      avgSentenceLength,
    },
  };
}
