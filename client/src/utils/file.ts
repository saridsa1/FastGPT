import mammoth from 'mammoth';
import Papa from 'papaparse';
import { getOpenAiEncMap } from './plugin/openai';
import { getErrText } from './tools';
import { uploadImg, postUploadFiles } from '@/api/system';

/**
 * upload file to mongo gridfs
 */
export const uploadFiles = (
  files: File[],
  metadata: Record<string, any> = {},
  percentListen?: (percent: number) => void
) => {
  const form = new FormData();
  form.append('metadata', JSON.stringify(metadata));
  files.forEach((file) => {
    form.append('file', file, encodeURIComponent(file.name));
  });
  return postUploadFiles(form, (e) => {
    if (!e.total) return;

    const percent = Math.round((e.loaded / e.total) * 100);
    percentListen && percentListen(percent);
  });
};

/**
 * Read txt file content
 */
export const readTxtContent = (file: File) => {
  return new Promise((resolve: (_: string) => void, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = (err) => {
        console.log('error txt read:', err);
        reject('Failed to read txt file');
      };
      reader.readAsText(file);
    } catch (error) {
      reject('The browser does not support reading file content');
    }
  });
};

/**
 * read pdf content
 */
export const readPdfContent = (file: File) =>
  new Promise<string>((resolve, reject) => {
    try {
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.workerSrc = '/js/pdf.worker.js';

      const readPDFPage = async (doc: any, pageNo: number) => {
        const page = await doc.getPage(pageNo);
        const tokenizedText = await page.getTextContent();

        const pageText = tokenizedText.items
          .map((token: any) => token.str)
          .filter((item: string) => item)
          .join('');
        return pageText;
      };

      let reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (event) => {
        if (!event?.target?.result) return reject('Failed to parse PDF');
        try {
          const doc = await pdfjsLib.getDocument(event.target.result).promise;
          const pageTextPromises = [];
          for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
            pageTextPromises.push(readPDFPage(doc, pageNo));
          }
          const pageTexts = await Promise.all(pageTextPromises);
          resolve(pageTexts.join('\n'));
        } catch (err) {
          console.log(err, 'pdf load error');
          reject('Failed to parse PDF');
        }
      };
      reader.onerror = (err) => {
        console.log(err, 'pdf load error');
        reject('Failed to parse PDF');
      };
    } catch (error) {
      reject('Browser does not support file content reading');
    }
  });

/**
 * read doc
 */
export const readDocContent = (file: File) =>
  new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async ({ target }) => {
        if (!target?.result) return reject('Failed to read doc file');
        try {
          const res = await mammoth.extractRawText({
            arrayBuffer: target.result as ArrayBuffer
          });
          resolve(res?.value);
        } catch (error) {
          window.umami?.track('wordReadError', {
            err: error?.toString()
          });
          console.log('error doc read:', error);

          reject('Failed to read doc file, please convert to PDF');
        }
      };
      reader.onerror = (err) => {
        window.umami?.track('wordReadError', {
          err: err?.toString()
        });
        console.log('error doc read:', err);

        reject('Failed to read doc file');
      };
    } catch (error) {
      reject('The browser does not support reading file content');
    }
  });

/**
 * read csv
 */
export const readCsvContent = async (file: File) => {
  try {
    const textArr = await readTxtContent(file);
    const json = Papa.parse(textArr).data as string[][];
    if (json.length === 0) {
      throw new Error('csv parsing failed');
    }
    return {
      header: json.shift()?.filter((item) => item) as string[],
      data: json.map((item) => item?.filter((item) => item))
    };
  } catch (error) {
    return Promise.reject('Failed to parse the csv file');
  }
};

/**
 * file download
 */
export const fileDownload = ({
  text,
  type,
  filename
}: {
  text: string;
  type: string;
  filename: string;
}) => {
  // Export to file
  const blob = new Blob([`\uFEFF${text}`], { type: `${type};charset=utf-8;` });

  //Create download link
  const downloadLink = document.createElement('a');
  downloadLink.href = window.URL.createObjectURL(blob);
  downloadLink.download = filename;

  //Add link to page and trigger download
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

/**
 * text split into chunks
 * maxLen - one chunk len. max: 3500
 * overlapLen - The size of the before and after Text
 * maxLen > overlapLen
 */
export const splitText2Chunks = ({ text, maxLen }: { text: string; maxLen: number }) => {
  const overlapLen = Math.floor(maxLen * 0.25); // Overlap length

  try {
    const splitTexts = text.split(/(?<=[.!?;.!?;])/g);
    const chunks: string[] = [];

    let preChunk = '';
    let chunk = '';
    for (let i = 0; i < splitTexts.length; i++) {
      const text = splitTexts[i];
      chunk += text;
      if (chunk.length > maxLen - overlapLen) {
        preChunk += text;
      }
      if (chunk.length >= maxLen) {
        chunks.push(chunk);
        chunk = preChunk;
        preChunk = '';
      }
    }

    if (chunk) {
      chunks.push(chunk);
    }

    const tokens = (() => {
      try {
        const enc = getOpenAiEncMap();
        const encodeText = enc.encode(chunks.join(''));
        const tokens = encodeText.length;
        return tokens;
      } catch (error) {
        return chunks.join('').length;
      }
    })();

    return {
      chunks,
      tokens
    };
  } catch (err) {
    throw new Error(getErrText(err));
  }
};

export const fileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * compress image.response base64
 * @param maxSize The max size of the compressed image
 */
export const compressImg = ({
  file,
  maxW = 200,
  maxH = 200,
  maxSize = 1024 * 100
}: {
  file: File;
  maxW?: number;
  maxH?: number;
  maxSize?: number;
}) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const img = new Image();
      // @ts-ignore
      img.src = reader.result;
      img.onload = async () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxW) {
            height *= maxW / width;
            width = maxW;
          }
        } else {
          if (height > maxH) {
            width *= maxH / height;
            height = maxH;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject('compressed image exception');
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL(file.type, 0.8);
        // remove the canvas element
        canvas.remove();

        if (compressedDataUrl.length > maxSize) {
          return reject('The picture is too big');
        }

        const src = await (async () => {
          try {
            const src = await uploadImg(compressedDataUrl);
            return src;
          } catch (error) {
            return compressedDataUrl;
          }
        })();

        resolve(src);
      };
    };
    reader.onerror = (err) => {
      console.log(err);
      reject('compressed image exception');
    };
  });

/* simple text, remove chinese space and extra \n */
export const simpleText = (text: string) => {
  text = text.replace(/([\u4e00-\u9fa5])\s+([\u4e00-\u9fa5])/g, '$1$2');
  text = text.replace(/\n{2,}/g, '\n');
  text = text.replace(/\s{2,}/g, ' ');

  text = text.replace(/[\x00-\x08]/g, ' ');

  return text;
};
