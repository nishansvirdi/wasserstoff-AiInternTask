/**
 * @file stopwords.ts
 * @description This module provides a list of common stopwords for filtering out
 * non-essential words in text processing tasks. These words are generally considered
 * low-information and are often removed in tasks such as text analysis, natural
 * language processing (NLP), and search optimization to improve accuracy and efficiency.
 */

/**
 * A predefined list of common stopwords in English. These words are typically removed
 * in text processing to reduce noise, as they are often not useful for understanding
 * the primary content or meaning of the text.
 *
 * This list can be expanded to include additional stopwords based on specific domain
 * requirements or language-specific terms.
 *
 * Example use cases:
 * - Filtering out these words in search indexing.
 * - Preprocessing text data for machine learning models.
 * - Simplifying user-generated content for content analysis.
 */
export const stopwords: string[] = [
    'the',
    'is',
    'in',
    'and',
    'a',
    'an',
    'of',
    'to',
    'it',
    'with',
    'for',
    'on',
    'that',
    'this',
    'as',
    'by',
    'at',
    'from',
    'or',
    'but',
    'not',
    'be',
    'are',
    'was',
    'were',
    'will',
    'has',
    'have',
    'had',
    'if',
    'then',
    'so',
    'such',
    'can',
    'all',
    'any',
    'do',
    'does',
    'did',
    'no',
    'yes',
    'you',
    'we',
    'they',
    'he',
    'she',
    'him',
    'her',
    'them',
    'our',
    'their',
    'its',
    'my',
    'your',
    'me',
    'I',
    // Add more stopwords as needed for your domain or language.
]
