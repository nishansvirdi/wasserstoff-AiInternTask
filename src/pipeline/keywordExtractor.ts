import { stopwords } from '../utils/stopwords'
import natural from 'natural'

// Initialize the tokenizer for splitting text into words
const tokenizer = new natural.WordTokenizer()

/**
 * Extracts keywords from a document using TF-IDF (Term Frequency-Inverse Document Frequency),
 * prioritizing domain-specific terms. This method helps identify important terms
 * in the document by weighting terms that are more unique within the given text.
 *
 * @param {string} text - The document text to analyze for keywords.
 * @param {string[]} domainSpecificWords - An array of domain-specific keywords to prioritize.
 * @returns {string[]} An array of the top keywords, ordered by importance.
 */
export const extractKeywordsWithTFIDF = (
    text: string,
    domainSpecificWords: string[],
): string[] => {
    // Initialize TF-IDF for the text document
    const tfidf = new natural.TfIdf()
    tfidf.addDocument(text)

    // Object to store each word's TF-IDF score
    const wordScores: { [word: string]: number } = {}

    // Tokenize text, score words, and filter stopwords
    tokenizer.tokenize(text.toLowerCase()).forEach((word) => {
        if (!stopwords.includes(word) && domainSpecificWords.includes(word)) {
            tfidf.tfidfs(word, (i, measure) => {
                wordScores[word] = measure
            })
        }
    })

    // Sort words by TF-IDF score in descending order
    const sortedKeywords = Object.entries(wordScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .map(([word]) => word)

    // Return the top 10 keywords
    return sortedKeywords.slice(0, 10)
}
