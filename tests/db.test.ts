import { connectToMongoDB, updateDocumentSummary } from '../src/utils/db'
import { Db, MongoClient } from 'mongodb'

// Mock the MongoDB module to control its behavior for testing
jest.mock('mongodb', () => {
    const actual = jest.requireActual('mongodb')
    return {
        ...actual,
        MongoClient: jest.fn().mockImplementation(() => ({
            connect: jest.fn().mockResolvedValue({}),
            db: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnValue({
                    updateOne: jest.fn().mockResolvedValue({}),
                }),
            }),
            close: jest.fn(),
        })),
    }
})

describe('Database Functions', () => {
    let db: Db
    let client: MongoClient

    /**
     * Establishes a connection to the mock MongoDB client before all tests
     * to ensure that the database functions have a mock connection available.
     */
    beforeAll(async () => {
        const connection = await connectToMongoDB()
        db = connection.db
        client = connection.client
    })

    /**
     * Closes the MongoDB client connection after all tests
     * to ensure that no resources are left open.
     */
    afterAll(async () => {
        if (client) {
            await client.close()
        }
    })

    /**
     * Tests that the database connection is established successfully
     * and that the `db` instance is defined.
     */
    it('should connect to MongoDB', async () => {
        expect(db).toBeDefined()
    })

    /**
     * Tests that the `updateDocumentSummary` function updates a document in the mock MongoDB
     * without throwing errors. This verifies that the function executes as expected.
     */
    it('should update document summary in MongoDB', async () => {
        const path = '/path/to/pdf'
        const summary = 'This is a summary.'
        const keywords = ['summary', 'document', 'text']

        await expect(
            updateDocumentSummary(path, summary, keywords),
        ).resolves.toBeUndefined()
    })
})
