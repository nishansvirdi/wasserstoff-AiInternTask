# PDF Summary Pipeline Internship

## Project Overview

The **PDF Summary Pipeline** is a Node.js application designed to automate the parsing, summarization, and keyword extraction of PDF documents. This project processes PDFs, extracts useful insights (summary and keywords), and saves them to a MongoDB database for easy access and analysis. The pipeline also includes memory checks and retry logic for reliable processing of large datasets.

## Features

-   **PDF Parsing**: Extracts text content from PDF files.
-   **Text Summarization**: Provides summaries of varying lengths using advanced sentence scoring.
-   **Keyword Extraction**: Extracts keywords using TF-IDF and domain-specific prioritization.
-   **Database Integration**: Updates MongoDB with extracted data and metadata.
-   **Memory Management**: Includes memory checks to ensure efficient processing.
-   **Retry Logic**: Attempts processing with exponential backoff in case of low memory or errors.

## Table of Contents

-   [Requirements](#requirements)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Project Structure](#project-structure)
-   [Scripts](#scripts)
-   [Environment Variables](#environment-variables)
-   [Dependencies](#dependencies)
-   [Author](#author)
-   [License](#license)

## Requirements

-   **Node.js** (>= 16.x)
-   **MongoDB** (Local or hosted instance)
-   **npm** (Package manager)

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/nishansvirdi/wasserstoff-AiInternTask.git
    cd pdf-summary-pipeline-internship
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables** (See [Environment Variables](#environment-variables)).

4. **Compile TypeScript**:

    ```bash
    npm run build
    ```

## Usage

### Running the Pipeline

To start the PDF processing pipeline:

```bash
npm start
```

This will run the compiled JavaScript version with `node --expose-gc dist/testPipeline.js`.

### Development Mode

For development with TypeScript, use:

```bash
npm run dev
```

This command uses `ts-node` to run the pipeline in TypeScript directly.

## Project Structure

```plaintext
pdf-summary-pipeline-internship/
├── src/
│   ├── pipeline/
│   │   ├── pdfParser.ts             # PDF parsing logic
│   │   ├── summarizer.ts            # Summarization logic
│   │   ├── keywordExtractor.ts      # Keyword extraction using TF-IDF
│   ├── utils/
│   │   ├── stopwords.ts             # List of stopwords for text filtering
│   │   ├── db.ts                    # MongoDB connection and update functions
│   ├── testPipeline.ts              # Entry point for testing the pipeline
├── dist/                            # Compiled JavaScript files
├── .env                             # Environment variables
├── package.json                     # Project metadata and dependencies
├── README.md                        # Project documentation
```

## Scripts

The `package.json` provides the following scripts:

-   **`start`**: Runs the compiled pipeline in production mode.
-   **`dev`**: Starts the pipeline in development mode with TypeScript.
-   **`build`**: Compiles TypeScript files to JavaScript.
-   **`test`**: Runs tests using Jest.
-   **`format`**: Formats code using Prettier.

Run any of these scripts using `npm run <script-name>`.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```plaintext
MONGODB_URI=mongodb://localhost:27017        # MongoDB connection URI
MONGODB_DB_NAME=pdfSummaryDB                 # MongoDB database name
```

## Dependencies

-   **axios**: Promise-based HTTP client for making API requests.
-   **cli-progress**: Command-line progress bar utility.
-   **colors**: Utility for adding colors to console output.
-   **dotenv**: Loads environment variables from `.env` files.
-   **jest**: Testing framework.
-   **mongodb**: MongoDB driver for Node.js.
-   **natural**: NLP library used for keyword extraction.
-   **p-limit**: Limits the number of concurrently executing asynchronous operations.
-   **pdf-lib**: PDF library for manipulation and parsing.
-   **pdf-parse**: Library for parsing PDF text.
-   **prettier**: Code formatter.
-   **ts-node**: TypeScript execution environment for Node.js.
-   **typescript**: TypeScript compiler.

### Dev Dependencies

-   **@types/cli-progress**: Type definitions for `cli-progress`.
-   **@types/jest**: Type definitions for Jest.
-   **@types/pdf-parse**: Type definitions for `pdf-parse`.
-   **ts-jest**: TypeScript preprocessor for Jest.

## Author

-   **Prabhjot Singh**

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
