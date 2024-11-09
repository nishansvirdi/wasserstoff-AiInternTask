import { summarizeTextWithAdvancedScoring } from '../src/pipeline/summarizer'

describe('summarizeTextWithAdvancedScoring', () => {
    // A sample long text to test different summary lengths
    const longText =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100)

    /**
     * Tests that the function returns a short summary with up to 3 sentences.
     */
    it('should return a short summary', () => {
        const summary = summarizeTextWithAdvancedScoring(longText, 'short')

        // Ensure the summary contains no more than 3 sentences
        expect(summary.split('. ').length).toBeLessThanOrEqual(3)
    })

    /**
     * Tests that the function returns a medium summary with up to 5 sentences.
     */
    it('should return a medium summary', () => {
        const summary = summarizeTextWithAdvancedScoring(longText, 'medium')

        // Ensure the summary contains no more than 5 sentences
        expect(summary.split('. ').length).toBeLessThanOrEqual(5)
    })

    /**
     * Tests that the function returns a long summary with up to 10 sentences.
     */
    it('should return a long summary', () => {
        const summary = summarizeTextWithAdvancedScoring(longText, 'long')

        // Ensure the summary contains no more than 10 sentences
        expect(summary.split('. ').length).toBeLessThanOrEqual(10)
    })
})
