import fs from 'fs'
import { MongoError } from 'mongodb'
import { connectToMongoDB } from '../config/mongodb'

/**
 * Logs an error message to both a file and the console.
 *
 * @param {Error} error - The error object to log.
 * @param {string} context - Contextual information to identify where the error occurred.
 */
export const logError = (error: Error, context: string) => {
    // Format error message with timestamp and context
    const errorMessage = `${new Date().toISOString()} [${context}] ${error.message}\n`

    // Append the error message to the 'error.log' file asynchronously
    fs.appendFile('error.log', errorMessage, () => {})

    // Log the error to the console for immediate visibility
    console.error(`[${context}]`, error.message)
}

/**
 * Updates or inserts a document summary in MongoDB, with automatic retry on transient errors.
 * This function ensures that each document entry in the database contains the provided summary,
 * keywords, and a timestamp indicating when it was processed.
 *
 * @param {string} path - The unique path of the document to update.
 * @param {string} summary - The summary of the document's content.
 * @param {string[]} keywords - An array of keywords relevant to the document's content.
 */
export const updateDocumentSummary = async (
    path: string,
    summary: string,
    keywords: string[],
) => {
    try {
        // Connect to MongoDB and get the 'documents' collection
        const db = await connectToMongoDB()
        const collection = db.db.collection('documents')

        // Update the document if it exists, otherwise insert it as a new entry
        await collection.updateOne(
            { path }, // Filter by document path to ensure uniqueness
            { $set: { summary, keywords, processedAt: new Date() } }, // Update fields
            { upsert: true }, // Create document if it does not exist
        )
    } catch (error) {
        // Handle MongoDB transient errors with a retry mechanism
        if (
            error instanceof MongoError &&
            error.hasErrorLabel('TransientTransactionError')
        ) {
            console.warn('Transient error in MongoDB, retrying...')

            // Retry update operation after a 5-second delay
            setTimeout(
                () => updateDocumentSummary(path, summary, keywords),
                5000,
            )
        }

        // Log other errors using the logError utility
        if (error instanceof Error) {
            logError(error, `Updating document summary for ${path}`)
        } else {
            console.error(`Unknown error type: ${error}`)
        }
    }
}
