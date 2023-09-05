// Import necessary modules

import fs from 'fs/promises';
import path from 'path';
import { translate } from '@vitalets/google-translate-api';

async function translateText(text) {
  try {
    const result = await translate(text, { from: 'zh-CN', to: 'en' });
    return result.text;
  } catch (error) {
    console.error('Error translating text:', error);
  }
}

// Function to process a single .tsx file
async function processFile(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  const translatedText = await translateText(data);
  await fs.writeFile(filePath, translatedText, 'utf8');
}

// Recursive function to process directories and subdirectories
async function processDirectory(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && path.extname(entry.name) === '.tsx') {
      await processFile(fullPath);
    }
  }
}

// Initiate the process from the root directory
const rootDirectory = './src'; // Change to your root directory path
processDirectory(rootDirectory).catch((error) => {
  console.error('Error processing files:', error);
});
