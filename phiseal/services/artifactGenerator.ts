/**
 * PhiSeal Artifact Generator
 * Creates analysis_log.json, phi_seal.json, and manifest.json
 * Per MASTER.md Section 7
 */

import type {
  AnalysisLog,
  PhiSeal,
  Manifest,
  ManifestFile,
  ReviewIntent,
  ReviewConstraints,
  Observation,
  OperatorState,
} from '../types/artifacts';

/**
 * Generate SHA-256 hash of content
 */
export async function generateSHA256(content: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}`;
  }

  // Fallback for non-browser environments
  throw new Error('SHA-256 generation requires Web Crypto API');
}

/**
 * Create analysis_log.json
 * Required after analysis
 */
export function createAnalysisLog(
  reviewId: string,
  intent: ReviewIntent,
  constraints: ReviewConstraints,
  operators: OperatorState,
  observations: Observation[]
): AnalysisLog {
  return {
    phiseal_version: '1.0',
    review_id: reviewId,
    created_at: new Date().toISOString(),
    intent,
    constraints,
    operators,
    observations,
  };
}

/**
 * Create phi_seal.json
 * Required when sealed (Ψ phase)
 */
export async function createPhiSeal(
  reviewId: string,
  documentText: string,
  spanMapJson: string,
  analysisLogJson: string,
  phiActions: number,
  deltaOpen: number,
  sealNote?: string
): Promise<PhiSeal> {
  const [docHash, spanHash, logHash] = await Promise.all([
    generateSHA256(documentText),
    generateSHA256(spanMapJson),
    generateSHA256(analysisLogJson),
  ]);

  return {
    phiseal_version: '1.0',
    review_id: reviewId,
    sealed_at: new Date().toISOString(),
    operators: {
      phase: 'Ψ',
      delta_open: deltaOpen,
      phi_actions: phiActions,
      psi_ready: true,
    },
    hashes: {
      document_txt: docHash,
      span_map: spanHash,
      analysis_log: logHash,
    },
    seal_note: sealNote || null,
  };
}

/**
 * Create manifest.json
 * Export/audit index (required when sealed)
 */
export async function createManifest(
  reviewId: string,
  files: { name: string; content: string }[]
): Promise<Manifest> {
  const manifestFiles: ManifestFile[] = await Promise.all(
    files.map(async (file) => ({
      name: file.name,
      sha256: (await generateSHA256(file.content)).replace('sha256:', ''),
    }))
  );

  return {
    review_id: reviewId,
    bundle_version: '1.0',
    sealed_at: new Date().toISOString(),
    files: manifestFiles,
  };
}

/**
 * Generate a unique review ID
 */
export function generateReviewId(): string {
  return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate observation has required span references
 */
export function validateObservationSpans(
  observations: Observation[],
  requireSpanRefs: boolean
): { valid: boolean; errors: string[] } {
  if (!requireSpanRefs) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  observations.forEach((obs, idx) => {
    if (!obs.spans || obs.spans.length === 0) {
      errors.push(`Observation ${idx + 1} (${obs.id}) missing span references`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check for verdict language violations
 */
export function checkVerdictLanguage(text: string): { hasViolation: boolean; violations: string[] } {
  const verdictWords = [
    'score',
    'correct',
    'incorrect',
    'wrong',
    'right',
    'proven',
    'disproven',
    'good',
    'bad',
    'strong',
    'weak',
    'excellent',
    'poor',
    'high quality',
    'low quality',
    'valid',
    'invalid',
    'true',
    'false',
  ];

  const violations: string[] = [];
  const lowerText = text.toLowerCase();

  verdictWords.forEach((word) => {
    if (lowerText.includes(word)) {
      violations.push(word);
    }
  });

  return {
    hasViolation: violations.length > 0,
    violations,
  };
}
