import { stopwords } from '../utils/stopwords'

/**
 * Summarizes text by scoring sentences based on word frequency.
 * Higher-scoring sentences are included in the summary, with scoring adjusted
 * by the sentence's position in the document.
 *
 * @param {string} text - The document text to summarize.
 * @param {'short' | 'medium' | 'long'} length - Desired summary length.
 *    - "short" returns approximately 3 sentences.
 *    - "medium" returns approximately 5 sentences.
 *    - "long" returns approximately 10 sentences.
 * @returns {string} A summary string composed of the top-scoring sentences.
 */
export const summarizeTextWithAdvancedScoring = (
    text: string,
    length: 'short' | 'medium' | 'long',
): string => {
    // Split text into sentences
    const sentences = text.split('. ')
    const sentenceScores: Map<string, number> = new Map()

    // Score each sentence based on word frequency and position
    sentences.forEach((sentence, index) => {
        const words = sentence.split(' ')

        // Calculate sentence score by counting significant words
        let score = words.reduce((acc, word) => {
            word = word.toLowerCase()
            return stopwords.includes(word) ? acc : acc + 1
        }, 0)

        // Increase score for sentences near the beginning (often more informative)
        const positionWeight = index < 5 ? 1.5 : 1
        sentenceScores.set(sentence, score * positionWeight)
    })

    // Sort sentences by score in descending order
    const sortedSentences = [...sentenceScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([sentence]) => sentence)

    // Select the top sentences based on desired summary length
    const numSentences = length === 'short' ? 3 : length === 'medium' ? 5 : 10
    return sortedSentences.slice(0, numSentences).join('. ') + '.'
}
