/**
 * PhiSeal Document Analysis API
 * Vercel Serverless Function
 * Powered by Anthropic Claude with HDT² Framework
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AnalysisRequest {
  file: string; // base64 encoded
  fileName: string;
  fileType: 'pdf' | 'docx';
  intent: 'analysis' | 'review' | 'audit';
}

// Load MASTER.md as system prompt
function loadSystemPrompt(): string {
  const masterPath = join(process.cwd(), 'instructions', 'MASTER.md');
  return readFileSync(masterPath, 'utf-8');
}

// Extract text from PDF
async function extractPdfText(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const data = await pdf(buffer);
  return data.text;
}

// Extract text from DOCX
async function extractDocxText(base64: string): Promise<string> {
  const buffer = Buffer.from(base64, 'base64');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Generate SHA-256 hash
function generateHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

// Parse Ω/Δ/Φ/Ψ output from Claude
function parseAnalysis(response: string): any {
  const delta: any[] = [];
  const assumptions: any[] = [];
  const conflicts: any[] = [];

  // Parse Δ (Gaps/Ambiguities)
  const deltaMatches = response.matchAll(/Δ(\d+).*?severity:\s*(high|medium|low).*?description:\s*"([^"]+)".*?context:\s*"([^"]+)"/gis);
  let deltaIndex = 1;
  for (const match of deltaMatches) {
    delta.push({
      id: `Δ${deltaIndex}`,
      severity: match[2].toLowerCase(),
      description: match[3],
      context: match[4],
    });
    deltaIndex++;
  }

  // Parse Assumptions
  const assumptionMatches = response.matchAll(/A(\d+).*?assumption:\s*"([^"]+)".*?basis:\s*"([^"]+)"/gis);
  let assumptionIndex = 1;
  for (const match of assumptionMatches) {
    assumptions.push({
      id: `A${assumptionIndex}`,
      assumption: match[2],
      basis: match[3],
    });
    assumptionIndex++;
  }

  // Parse Conflicts
  const conflictMatches = response.matchAll(/C(\d+).*?conflict:\s*"([^"]+)".*?locations:\s*\[(.*?)\]/gis);
  let conflictIndex = 1;
  for (const match of conflictMatches) {
    const locations = match[3].split(',').map(l => l.trim().replace(/"/g, ''));
    conflicts.push({
      id: `C${conflictIndex}`,
      conflict: match[2],
      locations,
    });
    conflictIndex++;
  }

  return { delta, assumptions, conflicts };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, fileName, fileType, intent }: AnalysisRequest = req.body;

    if (!file || !fileName || !fileType || !intent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Extract text based on file type
    let documentText: string;
    if (fileType === 'pdf') {
      documentText = await extractPdfText(file);
    } else if (fileType === 'docx') {
      documentText = await extractDocxText(file);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Generate file hash
    const fileHash = generateHash(documentText);

    // Load system prompt from MASTER.md
    const systemPrompt = loadSystemPrompt();

    // Create user prompt for document analysis
    const userPrompt = `Analyze the following document using the HDT² framework (Ω → Δ → Φ → Ψ).

Intent: ${intent}

Document content:
${documentText}

Please provide analysis in the following JSON structure:
{
  "delta": [
    {
      "id": "Δ₁",
      "severity": "high|medium|low",
      "description": "specific gap or ambiguity",
      "context": "relevant text from document"
    }
  ],
  "assumptions": [
    {
      "id": "A₁",
      "assumption": "what was assumed",
      "basis": "why it was assumed"
    }
  ],
  "conflicts": [
    {
      "id": "C₁",
      "conflict": "contradictory statements",
      "locations": ["page/section reference"]
    }
  ]
}

Remember:
- NO recommendations or advice
- NO gap-filling or hallucination
- Surface all unknowns explicitly
- Identify contradictions
- List all assumptions made
- Apply severity tags to all Δ items`;

    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract response text
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Try to parse JSON from response
    let analysis;
    try {
      // Look for JSON in code blocks or raw JSON
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/(\{[\s\S]*\})/);

      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback to regex parsing
        analysis = parseAnalysis(responseText);
      }
    } catch (parseError) {
      // If JSON parsing fails, use regex parsing
      analysis = parseAnalysis(responseText);
    }

    // Construct manifest
    const manifest = {
      manifest: {
        file_hash: fileHash,
        extraction_method: fileType === 'pdf' ? 'pdf-parse_v1.0' : 'mammoth_v1.0',
        timestamp: new Date().toISOString(),
        engine_version: 'phiseal_v0.1',
        intent,
      },
      analysis,
    };

    return res.status(200).json({
      success: true,
      manifest,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
    });
  }
}
