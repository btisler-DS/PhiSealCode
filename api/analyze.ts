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
  intent: string; // Intent statement
  scope?: string;
  constraints?: {
    stay_in_document: boolean;
    no_verdict_language: boolean;
    require_span_refs: boolean;
  };
  span_map?: any[]; // SpanReference[]
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
    const { file, fileName, fileType, intent, scope, constraints, span_map }: AnalysisRequest = req.body;

    if (!file || !fileName || !fileType || !intent) {
      return res.status(400).json({ error: 'Missing required fields: file, fileName, fileType, intent' });
    }

    // Default constraints if not provided
    const reviewConstraints = constraints || {
      stay_in_document: true,
      no_verdict_language: true,
      require_span_refs: true,
    };

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

    // Create user prompt for document analysis with PhiSeal principles + HDT² framework
    const constraintInstructions = [];
    if (reviewConstraints.stay_in_document) {
      constraintInstructions.push('- CONSTRAINT: Stay within the document. Do NOT introduce external facts. Flag unknowns explicitly.');
    }
    if (reviewConstraints.no_verdict_language) {
      constraintInstructions.push('- CONSTRAINT: No verdict language. Avoid: score, correct, wrong, proven, good, bad, strong, weak, valid, invalid.');
    }
    if (reviewConstraints.require_span_refs) {
      constraintInstructions.push('- CONSTRAINT: Every observation MUST reference specific spans (e.g., p3.s2, Section 2, Page 4).');
    }

    const userPrompt = `Review the following document according to the PhiSeal principles and HDT² framework:

CORE PRINCIPLES:
- You surface structural uncertainty (Δ). You do NOT answer, advise, or conclude.
- Use neutral language: "unclear," "unspecified," "not established," "appears to assume."
- NO scoring, grading, or verdicts.

ACTIVE CONSTRAINTS:
${constraintInstructions.join('\n')}

REVIEW INTENT (Ω - Intent Lock):
${intent}
${scope ? `SCOPE: ${scope}` : ''}

${span_map ? `SPAN MAP AVAILABLE:\n${span_map.length} spans tracked (p1.s1 format)\n` : ''}

DOCUMENT CONTENT:
${documentText}

Please provide observations in the following JSON structure:
{
  "observations": [
    {
      "id": "obs_001",
      "type": "missing_assumption | ambiguity | gap | tension | unresolved_reference",
      "description": "Neutral observation of what is structurally uncertain or unsupported",
      "spans": ["p3.s2", "p4.s1"],
      "status": "open"
    }
  ]
}

HDT² FRAMEWORK:
- Ω (Omega): Intent locked - ${intent}
- Δ (Delta): Surface uncertainty - generate observations
- Φ (Phi): Resolution attempts - user-initiated (not in this pass)
- Ψ (Psi): Seal readiness - determined after review

REMEMBER:
- NO external facts (${reviewConstraints.stay_in_document ? 'ENFORCED' : 'not enforced'})
- NO verdict language (${reviewConstraints.no_verdict_language ? 'ENFORCED' : 'not enforced'})
- ALL observations need span references (${reviewConstraints.require_span_refs ? 'REQUIRED' : 'optional'})`;

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
    let observations;
    try {
      // Look for JSON in code blocks or raw JSON
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/(\{[\s\S]*\})/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        observations = parsed.observations || [];
      } else {
        // Fallback: create a simple observation from the text
        observations = [{
          type: 'General observation',
          reference: 'Document',
          text: responseText,
          anchor: 'ref-1'
        }];
      }
    } catch (parseError) {
      // If JSON parsing fails, create a simple observation
      observations = [{
        type: 'Analysis',
        reference: 'Document',
        text: responseText,
        anchor: 'ref-1'
      }];
    }

    // Add IDs and normalize observations
    const observationsWithIds = observations.map((obs: any, idx: number) => ({
      id: obs.id || `obs_${Date.now()}_${idx}`,
      type: obs.type || 'ambiguity',
      description: obs.text || obs.description || 'No description',
      spans: obs.spans || (obs.reference ? [obs.reference] : []),
      status: obs.status || 'open',
    }));

    // HDT² Operator State
    const operators = {
      phase: 'Δ', // Delta - uncertainty surfaced
      omega_locked_at: new Date().toISOString(),
      delta_count: observationsWithIds.length,
      phi_actions: 0,
      psi_ready: false,
    };

    // Construct analysis_log.json structure (per MASTER.md)
    const analysisLog = {
      phiseal_version: '1.0',
      review_id: `review_${Date.now()}`,
      created_at: new Date().toISOString(),
      intent: {
        statement: intent,
        scope: scope || null,
      },
      constraints: reviewConstraints,
      operators,
      observations: observationsWithIds,
    };

    // Return analysis log + metadata
    return res.status(200).json({
      success: true,
      analysis_log: analysisLog,
      metadata: {
        file_hash: fileHash,
        extraction_method: fileType === 'pdf' ? 'pdf-parse_v1.0' : 'mammoth_v1.0',
        timestamp: new Date().toISOString(),
        engine_version: 'phiseal_v0.1',
      },
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
    });
  }
}
