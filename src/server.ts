import fs from 'fs/promises';
import express from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import https from 'https';
import path from 'path';
import colors from 'colors';
import pLimit from 'p-limit';
import { MultiBar, SingleBar } from 'cli-progress';
import dataset from '../Dataset.json';
import { processPDFs } from './pipeline';
import { storeInitialMetadata, connectToMongoDB } from './config/mongodb';

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'mysecretkey'; // Define a secret key

const processedFiles = new Set<string>();
const limit = pLimit(3);
const tempDir = path.resolve(__dirname, 'temp');
let startTime: number = 0;

const multiBar = new MultiBar({
  clearOnComplete: true,
  hideCursor: true,
  format: `${colors.cyan.bold('{filename}')} | {task} | {bar} | {percentage}%`,
  barCompleteChar: '█',
  barIncompleteChar: '░',
  autopadding: true,
});

const downloadProgressBars: Record<string, SingleBar> = {};
const processProgressBars: Record<string, SingleBar> = {};
let sseResponse: express.Response | null = null; // Store the SSE response for sending updates

// Function to send SSE updates
const sendSSEUpdate = (message: string) => {
  if (sseResponse) {
    sseResponse.write(`data: ${message}\n\n`);
  }
};

const downloadPDF = async (url: string, filename: string): Promise<string> => {
  const filePath = path.join(tempDir, filename);
  const axiosConfig: AxiosRequestConfig = {
    responseType: 'arraybuffer',
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  };

  downloadProgressBars[filename] = multiBar.create(100, 0, {
    filename: colors.green(`[📥] ${filename}`),
    task: colors.yellow('Downloading'),
  });

  try {
    const response = await axios.get(url, axiosConfig);
    await fs.writeFile(filePath, response.data);
    await storeInitialMetadata(filePath, response.data.byteLength);
    downloadProgressBars[filename].update(100);
    downloadProgressBars[filename].stop();
    sendSSEUpdate(`Downloaded ${filename}`);
    return filePath;
  } catch (error) {
    console.error(colors.red(`Failed to download ${url}:`), error);
    sendSSEUpdate(`Failed to download ${filename}`);
    throw error;
  }
};

const processDataset = async () => {
  if (global.gc) global.gc();
  const pdfPaths: string[] = [];
  await fs.mkdir(tempDir, { recursive: true });
  startTime = Date.now();

  console.log(colors.magenta.bold('\n🚀 Starting PDF Downloads...'));
  sendSSEUpdate('Starting PDF Downloads...');
   
  for (const [key, url] of Object.entries(dataset)) {
    try {
      const pdfPath = await downloadPDF(url, `${key}.pdf`);
      pdfPaths.push(pdfPath);
    } catch (error) {
      console.error(colors.red(`Error processing PDF ${key}:`), error);
      sendSSEUpdate(`Error processing PDF ${key}`);
    }
  }

  console.log(colors.magenta.bold('\n⚙️ Processing PDFs...'));
  sendSSEUpdate('Processing PDFs...');
   
  await Promise.all(
    pdfPaths.map((pdfPath) =>
      limit(async () => {
        if (processedFiles.has(pdfPath)) return;

        const filename = path.basename(pdfPath);
        processProgressBars[filename] = multiBar.create(100, 0, {
          filename: colors.green(`[🔄] ${filename}`),
          task: colors.cyan('Processing'),
        });

        try {
          await processPDFs(pdfPath);
          processedFiles.add(pdfPath);
          await fs.unlink(pdfPath);
          processProgressBars[filename].update(100);
          processProgressBars[filename].stop();
          sendSSEUpdate(`Processed ${filename}`);
          console.log(colors.green(`✅ Deleted processed PDF: ${filename}`));
        } catch (error) {
          console.error(colors.red(`Error processing or deleting PDF ${pdfPath}:`), error);
          sendSSEUpdate(`Error processing or deleting PDF ${filename}`);
        }
      }),
    ),
  );

  multiBar.stop();
  console.log(colors.magenta.bold('\n✔️ PDF processing complete.'));
  sendSSEUpdate('PDF processing complete.');
};

app.get('/process', async (req, res) => {
  const { key } = req.query;
  if (key !== SECRET_KEY) {
    return res.status(403).send('Forbidden: Invalid secret key');
  }

  try {
    sseResponse = res; // Assign response to sseResponse for sending updates
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Sends headers immediately to the client

    await connectToMongoDB();
    await processDataset();

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(colors.yellow.bold(`\n⌛ Total time taken: ${totalTime.toFixed(2)} seconds`));
    console.log(colors.green.bold(`📄 Files Processed: ${processedFiles.size}`));
    sendSSEUpdate(`PDF processing complete. Total time: ${totalTime.toFixed(2)} seconds.`);
  } catch (error) {
    console.error(colors.red('An error occurred during PDF processing:'), error);
    sendSSEUpdate('An error occurred during PDF processing.');
  } finally {
    sendSSEUpdate('Closing resources.');
    sseResponse = null; // Reset sseResponse to allow for new requests
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'terminal.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});