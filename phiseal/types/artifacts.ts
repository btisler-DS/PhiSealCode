/**
 * PhiSeal Artifact Schemas
 * Per MASTER.md Section 7: Data Models & Artifacts
 * Aligned with HDT² operator framework (Ω→Δ→Φ→Ψ)
 */

export type ReviewPhase = 'Ω' | 'Δ' | 'Φ' | 'Ψ';

export type ObservationType =
  | 'missing_assumption'
  | 'ambiguity'
  | 'gap'
  | 'tension'
  | 'unresolved_reference';

export type ObservationStatus = 'open' | 'acknowledged' | 'resolved' | 'waived';

export interface Observation {
  id: string;
  type: ObservationType;
  description: string;
  spans: string[]; // e.g., ["p3.s2", "p4.s1"]
  status: ObservationStatus;
}

export interface ReviewIntent {
  statement: string;
  scope?: string | null;
}

export interface ReviewConstraints {
  stay_in_document: boolean;
  no_verdict_language: boolean;
  require_span_refs: boolean;
}

export interface OperatorState {
  phase: ReviewPhase;
  omega_locked_at: string; // ISO-8601
  delta_count: number;
  phi_actions: number;
  psi_ready: boolean;
}

/**
 * analysis_log.json
 * Required after analysis
 */
export interface AnalysisLog {
  phiseal_version: string;
  review_id: string;
  created_at: string; // ISO-8601
  intent: ReviewIntent;
  constraints: ReviewConstraints;
  operators: OperatorState;
  observations: Observation[];
}

/**
 * phi_seal.json
 * Required when sealed (Ψ phase)
 */
export interface PhiSeal {
  phiseal_version: string;
  review_id: string;
  sealed_at: string; // ISO-8601
  operators: {
    phase: 'Ψ';
    delta_open: number;
    phi_actions: number;
    psi_ready: true;
  };
  hashes: {
    document_txt: string; // sha256:...
    span_map: string;
    analysis_log: string;
  };
  seal_note?: string | null;
}

/**
 * manifest.json
 * Export/audit index (required when sealed)
 */
export interface ManifestFile {
  name: string;
  sha256: string;
}

export interface Manifest {
  review_id: string;
  bundle_version: string;
  sealed_at: string; // ISO-8601
  files: ManifestFile[];
}

/**
 * HDT² State Machine
 * Ω → Δ → Φ → Ψ
 */
export class ReviewStateMachine {
  phase: ReviewPhase;
  omegaLockedAt?: string;
  deltaCount: number;
  phiActions: number;

  constructor() {
    this.phase = 'Ω'; // Start at intent lock
    this.deltaCount = 0;
    this.phiActions = 0;
  }

  /**
   * Lock intent (Ω)
   */
  lockIntent(timestamp: string = new Date().toISOString()): void {
    this.phase = 'Ω';
    this.omegaLockedAt = timestamp;
  }

  /**
   * Surface uncertainty (Δ)
   * Called after initial analysis produces observations
   */
  surfaceUncertainty(observationCount: number): void {
    this.phase = 'Δ';
    this.deltaCount = observationCount;
  }

  /**
   * Resolution attempt (Φ)
   * User-initiated closure action
   */
  attemptResolution(): void {
    if (this.phase === 'Δ' || this.phase === 'Φ') {
      this.phase = 'Φ';
      this.phiActions++;
    }
  }

  /**
   * Check if ready for sealing (Ψ)
   */
  checkSealReadiness(
    intent: ReviewIntent,
    documentExtracted: boolean,
    observations: Observation[],
    allObservationsHaveSpans: boolean
  ): boolean {
    const hasIntent = !!intent.statement;
    const hasObservationsOrMarked = observations.length > 0; // TODO: Add explicit "no issues found" marker
    const constraintsCompliant = allObservationsHaveSpans;

    return hasIntent && documentExtracted && hasObservationsOrMarked && constraintsCompliant;
  }

  /**
   * Seal review (Ψ)
   */
  seal(): void {
    this.phase = 'Ψ';
  }

  /**
   * Get operator state for logging
   */
  getState(): OperatorState {
    return {
      phase: this.phase,
      omega_locked_at: this.omegaLockedAt || new Date().toISOString(),
      delta_count: this.deltaCount,
      phi_actions: this.phiActions,
      psi_ready: this.phase === 'Ψ',
    };
  }
}
