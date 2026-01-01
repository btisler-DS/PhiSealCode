// Document processing service for PDF and DOCX files

export interface ProcessedDocument {
  text: string;
  metadata: {
    filename: string;
    pageCount?: number;
    wordCount: number;
  };
}

/**
 * Extract text from PDF file (web version using PDF.js)
 */
export async function extractTextFromPDF(file: File): Promise<ProcessedDocument> {
  try {
    // Dynamic import for web-only PDF.js
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return {
      text: fullText.trim(),
      metadata: {
        filename: file.name,
        pageCount: pdf.numPages,
        wordCount: fullText.trim().split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX file using mammoth
 */
export async function extractTextFromDOCX(file: File): Promise<ProcessedDocument> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    return {
      text: text.trim(),
      metadata: {
        filename: file.name,
        wordCount: text.trim().split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Process document based on file type
 */
export async function processDocument(file: File): Promise<ProcessedDocument> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
}
