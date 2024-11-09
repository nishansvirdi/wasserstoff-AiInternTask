import { extractKeywordsWithTFIDF } from '../src/pipeline/keywordExtractor'

describe('extractKeywordsWithTFIDF', () => {
    const text =
        'Artificial intelligence and machine learning are crucial fields in data science.'
    const domainWords = [
        'artificial',
        'intelligence',
        'machine',
        'learning',
        'data',
        'science',
    ]

    /**
     * Tests that `extractKeywordsWithTFIDF` successfully extracts relevant domain-specific
     * keywords from the provided text.
     */
    it('should extract keywords from the given text', () => {
        const keywords = extractKeywordsWithTFIDF(text, domainWords)

        // Expect extracted keywords to contain specific domain-relevant words
        expect(keywords).toEqual(
            expect.arrayContaining([
                'artificial',
                'intelligence',
                'machine',
                'learning',
            ]),
        )

        // Ensure the number of extracted keywords does not exceed the specified limit
        expect(keywords.length).toBeLessThanOrEqual(10)
    })

    /**
     * Tests that `extractKeywordsWithTFIDF` returns an empty array when no domain-specific
     * words are present in the text, ensuring it handles irrelevant content correctly.
     */
    it('should return an empty array if no domain-specific words are found', () => {
        const unrelatedText = 'Hello world!'
        const keywords = extractKeywordsWithTFIDF(unrelatedText, domainWords)

        // Expect no keywords to be extracted since no domain words match the input text
        expect(keywords).toEqual([])
    })
})
