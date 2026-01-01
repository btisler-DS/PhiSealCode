// Document processing service for PDF and DOCX files
// Aligned with PhiSeal MASTER.md specification

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path globally for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.530/pdf.worker.min.mjs';
}

export interface SpanReference {
  span_id: string;
  char_start: number;
  char_end: number;
  section?: string;
  page?: number;
  paragraph?: number;
}

export interface ProcessedDocument {
  text: string;
  span_map: SpanReference[];
  metadata: {
    filename: string;
    pageCount?: number;
    wordCount: number;
  };
}

/**
 * Create span map from text
 * Per MASTER.md: Preserve section boundaries, paragraph indices, sentence offsets
 */
function createSpanMap(text: string, pageInfo?: { pageNumber: number; charOffset: number }[]): SpanReference[] {
  const spans: SpanReference[] = [];
  const paragraphs = text.split('\n\n');
  let charOffset = 0;

  paragraphs.forEach((para, pIndex) => {
    if (para.trim()) {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      let paraOffset = 0;

      sentences.forEach((sentence, sIndex) => {
        const start = charOffset + paraOffset;
        const end = start + sentence.length;

        // Find page number if pageInfo provided
        const page = pageInfo?.find(p => start >= p.charOffset)?.pageNumber;

        spans.push({
          span_id: `p${pIndex + 1}.s${sIndex + 1}`,
          char_start: start,
          char_end: end,
          paragraph: pIndex + 1,
          page,
        });

        paraOffset += sentence.length;
      });

      charOffset += para.length + 2; // +2 for \n\n
    }
  });

  return spans;
}

/**
 * Extract text from PDF file (web version using PDF.js)
 */
export async function extractTextFromPDF(file: File): Promise<ProcessedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const pageInfo: { pageNumber: number; charOffset: number }[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      pageInfo.push({ pageNumber: i, charOffset: fullText.length });

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    const trimmedText = fullText.trim();
    const span_map = createSpanMap(trimmedText, pageInfo);

    return {
      text: trimmedText,
      span_map,
      metadata: {
        filename: file.name,
        pageCount: pdf.numPages,
        wordCount: trimmedText.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const trimmedText = result.value.trim();
    const span_map = createSpanMap(trimmedText);

    return {
      text: trimmedText,
      span_map,
      metadata: {
        filename: file.name,
        wordCount: trimmedText.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
