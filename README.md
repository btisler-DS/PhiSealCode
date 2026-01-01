# PhiSeal

Mobile app for document ambiguity analysis using the HDT² framework.

## Overview

PhiSeal analyzes documents (PDF/DOCX) to identify:
- **Gaps (Δ)**: Ambiguities and missing information with severity levels
- **Assumptions**: Implicit assumptions made in the document
- **Conflicts**: Contradictory statements within the document

## Tech Stack

### Frontend
- **React Native** with **Expo** (iOS + Android + Web)
- Cross-platform document picker
- AsyncStorage for local manifest storage

### Backend
- **Vercel** serverless functions
- **Anthropic Claude** (Sonnet 4.5) for HDT² analysis
- PDF/DOCX text extraction (pdf-parse, mammoth)
- SHA-256 file hashing for verification

### Analysis Framework
- **HDT²** (Ω → Δ → Φ → Ψ) reasoning cycle
- **MASTER.md**: System prompt with Edos Covenant License v1.0
- **Deterministic**: Same input + version → same output

## Project Structure

```
phiseal/
├── api/
│   ├── analyze.ts          # Document analysis endpoint
│   └── manifests.ts        # Manifest storage/retrieval
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.tsx
│   │   ├── UploadScreen.tsx
│   │   ├── ProcessingScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── QuestionScreen.tsx
│   │   └── ExportScreen.tsx
│   ├── components/
│   │   ├── DeltaItem.tsx
│   │   ├── AssumptionItem.tsx
│   │   └── ConflictItem.tsx
│   ├── types/
│   │   └── manifest.ts
│   └── utils/
│       ├── api.ts
│       └── hash.ts
├── instructions/
│   └── MASTER.md           # HDT² system prompt
├── App.tsx
├── vercel.json
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Vercel CLI (`npm install -g vercel`)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/btisler-DS/PhiSealCode.git
   cd PhiSealCode/phiseal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Expo development server:**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator:**
   - Press `a` for Android
   - Press `i` for iOS simulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app

### Vercel Deployment

1. **Link to Vercel project:**
   ```bash
   cd phiseal
   vercel link
   ```

2. **Set environment variable:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   Enter your Anthropic API key when prompted.

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Update mobile app API URL:**
   - After deployment, update `EXPO_PUBLIC_API_URL` in your environment
   - Or create `.env` file:
     ```
     EXPO_PUBLIC_API_URL=https://your-vercel-url.vercel.app
     ```

## API Endpoints

### POST /api/analyze
Analyze a document using HDT² framework.

**Request:**
```json
{
  "file": "base64_encoded_content",
  "fileName": "document.pdf",
  "fileType": "pdf",
  "intent": "analysis"
}
```

**Response:**
```json
{
  "success": true,
  "manifest": {
    "manifest": {
      "file_hash": "sha256_hash",
      "extraction_method": "pdf-parse_v1.0",
      "timestamp": "2025-01-01T00:00:00.000Z",
      "engine_version": "phiseal_v0.1",
      "intent": "analysis"
    },
    "analysis": {
      "delta": [...],
      "assumptions": [...],
      "conflicts": [...]
    }
  }
}
```

### POST /api/manifests
Store a manifest for audit trail.

### GET /api/manifests?id={id}
Retrieve a specific manifest.

### GET /api/manifests
Retrieve all manifests (last 50).

## HDT² Framework

### Ω (Omega) - Intent
Clarifies the analysis purpose (analysis | review | audit).

### Δ (Delta) - Gaps & Ambiguities
Identifies uncertainties with severity grading:
- **High**: Critical gaps that affect validity
- **Medium**: Moderate ambiguities
- **Low**: Minor unclear points

### Φ (Phi) - Propositions
Lists key statements with validation tags:
- `::Φ_validate::pass` - Well supported
- `::Φ_validate::fail` - Contradicted
- `::Φ_validate::unknown` - Incomplete/speculative

### Ψ (Psi) - Reflection
Integrity check, limitations, and impact forecast.

## Critical Constraints

**Must enforce:**
- No recommendations in output
- No advice language ("you should", "we recommend")
- No persuasive framing
- Deterministic analysis
- Version locked at `phiseal_v0.1`
- All manifests include: hash, timestamp, version, intent

**Must NOT do:**
- Train or learn from documents
- Update analysis engine without version bump
- Analyze images in documents
- Fill in gaps or guess at meaning
- Provide interpretations beyond structure

## License

Governed by the **Edos Covenant License v1.0** - © Bruce Tisler

See `instructions/MASTER.md` for full license text.

## Manifest Structure

Every analysis generates a verifiable manifest:

```json
{
  "manifest": {
    "file_hash": "sha256_hash",
    "extraction_method": "pdf-parse_v1.0 | mammoth_v1.0",
    "timestamp": "ISO_timestamp",
    "engine_version": "phiseal_v0.1",
    "intent": "analysis | review | audit"
  },
  "analysis": {
    "delta": [
      {
        "id": "Δ₁",
        "severity": "high | medium | low",
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
        "locations": ["page/section references"]
      }
    ]
  }
}
```

## Storage

- **Client-side**: AsyncStorage (local-first)
- **Server-side**: Vercel serverless (audit trail)
- **Future**: Vercel KV for persistent storage

## Development Notes

- Engine version: `phiseal_v0.1`
- Same input + version = same output (deterministic)
- No silent failures - all errors surfaced
- Manifest reproducibility guaranteed
- Φ-Seal verification available for uploaded manifests

## Contributing

This project operates under the Edos Covenant License v1.0.
All derivatives must preserve:
- HDT² cycle integrity (Ω → Δ → Φ → Ψ)
- Auditability and provenance
- License attribution

## Contact

For questions or issues, please open a GitHub issue.

---

**Φ-Seal Footer:**
```
ΩΔΦΨ Cycle Integrity Active
Φ_validate field required for closure
Edos Covenant License v1.0 · © Bruce Tisler
```
