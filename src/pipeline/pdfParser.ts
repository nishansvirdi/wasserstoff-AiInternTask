import fs from 'fs/promises'
import pdfParse from 'pdf-parse'

/**
 * Parses a PDF file to extract text and metadata.
 * This function reads the PDF file from the specified path and extracts its
 * text content, along with metadata including file size, page count, and
 * PDF document information.
 *
 * @param {string} filePath - The path to the PDF file to parse.
 * @returns {Promise<{ text: string, metadata: { path: string, size: number, pageCount: number, info: object } }>}
 *    A promise that resolves to an object containing the extracted text and metadata:
 *    - `text`: The full text content extracted from the PDF.
 *    - `metadata`: An object with details about the PDF file, including:
 *        - `path`: The file path.
 *        - `size`: The file size in bytes.
 *        - `pageCount`: The total number of pages in the PDF.
 *        - `info`: Additional PDF document information (e.g., author, title).
 */
export const parsePDF = async (filePath: string) => {
    // Read the PDF file from the specified path
    const fileData = await fs.readFile(filePath)

    // Parse PDF content and metadata using pdf-parse
    const pdfData = await pdfParse(fileData)

    return {
        text: pdfData.text, // Extracted text content from the PDF
        metadata: {
            path: filePath, // Original file path
            size: fileData.byteLength, // File size in bytes
            pageCount: pdfData.numpages, // Number of pages in the PDF
            info: pdfData.info, // Additional PDF metadata (e.g., title, author)
        },
    }
}
