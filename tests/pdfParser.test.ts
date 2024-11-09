import { parsePDF } from '../src/pipeline/pdfParser'
import fs from 'fs/promises'
import path from 'path'

describe('parsePDF', () => {
    it('should parse the PDF and return text and metadata', async () => {
        // Path to a sample PDF file located in the test folder
        const filePath = path.join(__dirname, './__mocks__/sample.pdf')

        // Check if the sample PDF file exists
        try {
            await fs.access(filePath)
        } catch {
            throw new Error(
                'Sample PDF file not found. Please add a sample PDF file named "sample.pdf" to the test folder.',
            )
        }

        // Parse the PDF file and retrieve text and metadata
        const pdfData = await parsePDF(filePath)

        // Validate the presence and type of the 'text' field
        expect(pdfData).toHaveProperty('text')
        expect(typeof pdfData.text).toBe('string')

        // Validate the presence and properties of the 'metadata' object
        expect(pdfData).toHaveProperty('metadata')
        expect(pdfData.metadata).toHaveProperty('path', filePath)
        expect(pdfData.metadata).toHaveProperty('size')
        expect(typeof pdfData.metadata.size).toBe('number')
        expect(pdfData.metadata).toHaveProperty('pageCount')
        expect(typeof pdfData.metadata.pageCount).toBe('number')
    })
})
