import { MongoClient, Db } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables from a .env file
dotenv.config()

/**
 * MongoDB connection URI and database name from environment variables.
 * If not provided, defaults to local MongoDB instance and 'pdfSummaryDB' database.
 */
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB_NAME || 'pdfSummaryDB'

// Cached MongoDB database and client instances
let db: Db | null = null
let client: MongoClient | null = null

/**
 * Establishes and returns a connection to MongoDB. Caches the connection to
 * reuse it across multiple calls within the same application lifecycle.
 *
 * @returns {Promise<{ db: Db, client: MongoClient }>} A promise that resolves with the database and client instances.
 */
export const connectToMongoDB = async (): Promise<{
    db: Db
    client: MongoClient
}> => {
    if (!db || !client) {
        client = new MongoClient(uri)
        await client.connect()
        db = client.db(dbName)
        console.log('Connected to MongoDB')
    }
    return { db, client }
}

/**
 * Updates a document in the 'documents' collection with the provided summary and keywords.
 * If the document doesn't exist, it will be created (upsert operation).
 *
 * @param {string} path - The unique path of the document to update.
 * @param {string} summary - The summary text describing the document's content.
 * @param {string[]} keywords - An array of keywords associated with the document's content.
 */
export const updateDocumentSummary = async (
    path: string,
    summary: string,
    keywords: string[],
) => {
    const { db } = await connectToMongoDB()
    const collection = db.collection('documents')

    await collection.updateOne(
        { path },
        {
            $set: {
                summary,
                keywords,
                processed: true,
                processedAt: new Date(),
            },
        },
        { upsert: true }, // Inserts document if not found
    )
}

/**
 * Stores initial metadata for a document in the 'documents' collection.
 * Used for recording file size and creation date before processing.
 *
 * @param {string} path - The file path of the document.
 * @param {number} size - The size of the document in bytes.
 */
export const storeInitialMetadata = async (path: string, size: number) => {
    const { db } = await connectToMongoDB()
    const collection = db.collection('documents')

    const metadata = {
        path,
        size,
        processed: false,
        processedAt: null,
        createdAt: new Date(),
    }

    await collection.insertOne(metadata)
}
