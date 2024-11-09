import os from 'os'
import { parsePDF } from './pdfParser'
import { summarizeTextWithAdvancedScoring } from './summarizer'
import { extractKeywordsWithTFIDF } from './keywordExtractor'
import { updateDocumentSummary } from '../utils/db'
import { performance } from 'perf_hooks'

const MIN_FREE_MEMORY = 10 * 1024 * 1024 // Minimum required memory for processing, in bytes
const INITIAL_RETRY_DELAY_MS = 5000 // Initial delay between retries, in milliseconds
const MAX_RETRY_COUNT = 5 // Maximum number of retry attempts

/**
 * Checks available system memory to determine if there is enough to process a PDF.
 *
 * @returns {boolean} - Returns true if sufficient memory is available.
 */
const checkMemory = (): boolean => {
    const freeMemory = os.freemem()
    const nodeMemoryUsage =
        process.memoryUsage().heapTotal - process.memoryUsage().heapUsed

    console.log(`OS free memory: ${freeMemory} bytes`)
    console.log(`Node.js heap free memory: ${nodeMemoryUsage} bytes`)

    return freeMemory > MIN_FREE_MEMORY && nodeMemoryUsage > MIN_FREE_MEMORY / 2
}

/**
 * Processes a PDF document with retry logic and performance logging.
 * This function reads the PDF, generates a summary, extracts keywords, and updates
 * the document record in the database. If memory is insufficient or an error occurs,
 * it will retry with exponential backoff up to a specified maximum number of attempts.
 *
 * @param {string} path - The file path to the PDF to be processed.
 * @param {number} [retryCount=MAX_RETRY_COUNT] - The maximum number of retry attempts.
 * @param {number} [delay=INITIAL_RETRY_DELAY_MS] - Initial delay between retries, in milliseconds.
 */
const processPDFWithRetry = async (
    path: string,
    retryCount: number = MAX_RETRY_COUNT,
    delay: number = INITIAL_RETRY_DELAY_MS,
) => {
    const startTime = performance.now()

    for (let attempt = 1; attempt <= retryCount; attempt++) {
        const isFinalAttempt = attempt === retryCount

        if (checkMemory() || isFinalAttempt) {
            try {
                // Parse PDF to extract text and metadata
                const pdfData = await parsePDF(path)

                // Determine summary length based on document length
                const length =
                    pdfData.text.length < 1000
                        ? 'short'
                        : pdfData.text.length < 5000
                          ? 'medium'
                          : 'long'

                // Generate summary and extract keywords
                const summary = summarizeTextWithAdvancedScoring(
                    pdfData.text,
                    length,
                )
                const keywords = extractKeywordsWithTFIDF(pdfData.text, [
                    'specific',
                    'domain',
                    'words',
                ])

                // Update document record in the database
                await updateDocumentSummary(
                    pdfData.metadata.path,
                    summary,
                    keywords,
                )

                console.log(`Successfully processed PDF: ${path}`)

                // Log performance metrics
                const endTime = performance.now()
                console.log(
                    `Time taken for ${path}: ${(endTime - startTime).toFixed(2)} ms`,
                )

                const usedMemory = os.totalmem() - os.freemem()
                console.log(
                    `Memory usage: ${(usedMemory / (1024 * 1024)).toFixed(2)} MB`,
                )
                break
            } catch (error) {
                console.error(
                    `Error processing PDF ${path} on attempt ${attempt}:`,
                    error,
                )
                if (isFinalAttempt) {
                    console.error(
                        `Failed to process ${path} after ${retryCount} attempts`,
                    )
                }
            }
        } else {
            console.warn(
                `Low memory, delaying processing of ${path}. Retry attempt ${attempt}`,
            )
            await new Promise((resolve) => setTimeout(resolve, delay))
            delay *= 2 // Exponential backoff for retry delay
        }
    }
}

export { processPDFWithRetry as processPDFs }
