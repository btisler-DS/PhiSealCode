/**
 * PhiSeal Analysis Manifest Types
 * Based on HDT² framework (Ω → Δ → Φ → Ψ)
 */

export type IntentType = 'analysis' | 'review' | 'audit';

export type SeverityLevel = 'high' | 'medium' | 'low';

export type ValidationTag = 'pass' | 'fail' | 'unknown';

export interface DeltaItem {
  id: string;
  severity: SeverityLevel;
  description: string;
  context: string;
}

export interface Assumption {
  id: string;
  assumption: string;
  basis: string;
}

export interface Conflict {
  id: string;
  conflict: string;
  locations: string[];
}

export interface Analysis {
  delta: DeltaItem[];
  assumptions: Assumption[];
  conflicts: Conflict[];
}

export interface Manifest {
  manifest: {
    file_hash: string;
    extraction_method: string;
    timestamp: string;
    engine_version: string;
    intent: IntentType;
  };
  analysis: Analysis;
}

export interface AnalysisRequest {
  file: string; // base64 encoded file
  fileName: string;
  fileType: 'pdf' | 'docx';
  intent: IntentType;
}

export interface AnalysisResponse {
  manifest: Manifest;
  success: boolean;
  error?: string;
}

export interface StoredManifest extends Manifest {
  id: string;
  storedAt: string;
}
