import fs from 'fs/promises'
import axios, { AxiosRequestConfig } from 'axios'
import https from 'https'
import path from 'path'
import colors from 'colors'
import pLimit from 'p-limit'
import { MultiBar, SingleBar } from 'cli-progress'
import dataset from '../Dataset.json'
import { processPDFs } from './pipeline'
import { storeInitialMetadata, connectToMongoDB } from './config/mongodb'

/**
 * Set of filenames for already processed files to prevent re-processing.
 */
const processedFiles = new Set<string>()

/**
 * Limits concurrent PDF processing tasks to 3.
 */
const limit = pLimit(3)

/**
 * Temporary directory path for storing downloaded files.
 */
const tempDir = path.resolve(__dirname, 'temp')

/**
 * Timer start for tracking total processing time.
 */
let startTime: number = 0

/**
 * CLI multi-bar instance for tracking download and processing progress.
 */
const multiBar = new MultiBar({
    clearOnComplete: true,
    hideCursor: true,
    format: `${colors.cyan.bold('{filename}')} | {task} | {bar} | {percentage}%`,
    barCompleteChar: '█',
    barIncompleteChar: '░',
    autopadding: true,
})

/**
 * Individual progress bars for download and processing tasks.
 */
const downloadProgressBars: Record<string, SingleBar> = {}
const processProgressBars: Record<string, SingleBar> = {}

/**
 * Downloads a PDF file from the specified URL and saves it to the local filesystem.
 * Initializes and updates a progress bar to track download status.
 *
 * @param {string} url - The URL of the PDF file to download.
 * @param {string} filename - The name of the file to save the PDF as.
 * @returns {Promise<string>} - A promise that resolves to the file path of the downloaded PDF.
 * @throws Will throw an error if the download fails.
 */
const downloadPDF = async (url: string, filename: string): Promise<string> => {
    const filePath = path.join(tempDir, filename)
    const axiosConfig: AxiosRequestConfig = {
        responseType: 'arraybuffer',
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    }

    downloadProgressBars[filename] = multiBar.create(100, 0, {
        filename: colors.green(`[📥] ${filename}`),
        task: colors.yellow('Downloading'),
    })

    try {
        const response = await axios.get(url, axiosConfig)
        await fs.writeFile(filePath, response.data)
        await storeInitialMetadata(filePath, response.data.byteLength)
        downloadProgressBars[filename].update(100)
        downloadProgressBars[filename].stop()
        return filePath
    } catch (error) {
        console.error(colors.red(`Failed to download ${url}:`), error)
        throw error
    }
}

/**
 * Processes the entire dataset of URLs provided in `Dataset.json`.
 * Downloads each PDF and processes it with a configurable concurrency limit.
 * Cleans up processed files from the filesystem.
 *
 * @returns {Promise<void>} - A promise that resolves once all files are processed.
 */
const processDataset = async () => {
    if (global.gc) global.gc() // Force garbage collection if available
    const pdfPaths: string[] = []
    await fs.mkdir(tempDir, { recursive: true })
    startTime = Date.now()

    console.log(colors.magenta.bold('\n🚀 Starting PDF Downloads...'))
    for (const [key, url] of Object.entries(dataset)) {
        try {
            const pdfPath = await downloadPDF(url, `${key}.pdf`)
            pdfPaths.push(pdfPath)
        } catch (error) {
            console.error(colors.red(`Error processing PDF ${key}:`), error)
        }
    }

    console.log(colors.magenta.bold('\n⚙️ Processing PDFs...'))
    await Promise.all(
        pdfPaths.map((pdfPath) =>
            limit(async () => {
                if (processedFiles.has(pdfPath)) return

                const filename = path.basename(pdfPath)

                // Initialize a progress bar for this file's processing
                processProgressBars[filename] = multiBar.create(100, 0, {
                    filename: colors.green(`[🔄] ${filename}`),
                    task: colors.cyan('Processing'),
                })

                try {
                    await processPDFs(pdfPath)
                    processedFiles.add(pdfPath)
                    await fs.unlink(pdfPath)
                    processProgressBars[filename].update(100) // Set progress to 100% on completion
                    processProgressBars[filename].stop()
                    console.log(
                        colors.green(`✅ Deleted processed PDF: ${filename}`),
                    )
                } catch (error) {
                    console.error(
                        colors.red(
                            `Error processing or deleting PDF ${pdfPath}:`,
                        ),
                        error,
                    )
                }
            }),
        ),
    )

    multiBar.stop()
    console.log(colors.magenta.bold('\n✔️ PDF processing complete.'))
}

// Main execution block
;(async () => {
    try {
        await connectToMongoDB() // Ensure MongoDB is connected
        await processDataset()
    } catch (error) {
        console.error(
            colors.red('An error occurred during PDF processing:'),
            error,
        )
    } finally {
        const totalTime = (Date.now() - startTime) / 1000
        console.log(
            colors.yellow.bold(
                `\n⌛ Total time taken: ${totalTime.toFixed(2)} seconds`,
            ),
        )
        console.log(
            colors.green.bold(`📄 Files Processed: ${processedFiles.size}`),
        )
        console.log(colors.yellow('Closing resources and exiting...'))
        process.exit(0) // Exit the process once all work is complete
    }
})()
