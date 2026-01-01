# PhiSeal Review Workspace - Implementation Complete

## Overview

PhiSeal is a document review workspace that surfaces structural uncertainty without asserting conclusions. It follows a document-first design philosophy, providing neutral observations about ambiguities, gaps, and tensions within documents.

## Core Design Principles

### 1. Document-First Architecture
- The uploaded document is the visual anchor of the entire system
- Never subordinated to analysis outputs
- Clean reading layout with generous whitespace
- Calm, professional aesthetic (legal review room, not dashboard)

### 2. Neutral Analysis
- **NO scoring, grading, or verdicts**
- **NO "good/bad," "strong/weak," or confidence percentages**
- Uses neutral language: "unclear," "unspecified," "not established," "appears to assume"
- Surfaces what is structurally uncertain or missing
- Stays within the document (no external facts or gap-filling)

### 3. User Mental Model
The interface implicitly communicates:
- "This document is the object"
- "These are the conditions I set"
- "This is what the system sees"
- "This is where uncertainty lives"

## Features Implemented

### ✅ Three-Panel Layout
- **Left Rail**: Intent & constraints configuration
  - Intent statement field
  - Optional scope field
  - Three constraint toggles:
    - Stay within the document
    - No verdict language
    - Always point to source spans

- **Center Plane**: Document viewer (the primary object)
  - Document upload (PDF/DOCX)
  - Clean reading surface
  - Text extraction and display

- **Right Rail**: System observations
  - Neutral observations list
  - Observation types: Ambiguity | Missing assumption | Gap | Unresolved reference | Tension
  - Each observation includes reference to document location

### ✅ Intent System
Four preset review modes:
1. **Check for missing assumptions or gaps**
   - Surface unstated premises, leaps of logic, undefined terms
2. **Prepare material for external review or audit**
   - Prioritize traceability, explicit references, unresolved claims
3. **Review reasoning in a document**
   - Focus on argument structure, claims, support, internal consistency
4. **Diagnose why a decision or argument is not settling**
   - Surface competing frames, missing criteria, unresolved tradeoffs

### ✅ Document Processing
- PDF text extraction using PDF.js
- DOCX text extraction using mammoth
- Drag-and-drop upload
- File picker for browsers
- Word count and metadata display

### ✅ AI Analysis Integration
- Claude Sonnet 4 API integration
- PhiSeal-specific system prompt emphasizing neutral observations
- Structured observation output
- No hallucination or gap-filling
- Explicit flagging of unknowns

### ✅ Export Functionality
- Export review as JSON
- Includes:
  - Document metadata
  - Intent and constraints
  - Full document content
  - All observations
  - Timestamp

## Technical Stack

### Frontend
- **React Native Web** with Expo
- **TypeScript** for type safety
- **PDF.js** for PDF text extraction
- **Mammoth** for DOCX processing
- Custom document processor service

### Backend
- **Vercel Serverless Functions**
- **Claude Sonnet 4** (via Anthropic API)
- **pdf-parse** for server-side PDF processing
- **TypeScript** for type-safe APIs

### Deployment
- Frontend: Expo web server (localhost:8082)
- Backend API: https://phi-seal-code.vercel.app
- API Endpoints:
  - `POST /api/analyze` - Document analysis endpoint

## File Structure

```
PhiSealCode/
├── api/
│   ├── analyze.ts           # PhiSeal document analysis API
│   └── manifests.ts         # Manifest generation
├── phiseal/
│   ├── app/
│   │   └── (tabs)/
│   │       └── index.tsx    # Main PhiSeal workspace UI
│   ├── services/
│   │   └── documentProcessor.ts  # PDF/DOCX extraction
│   └── package.json
├── instructions/
│   └── MASTER.md           # System prompt for Claude
└── README.md
```

## Usage Instructions

### 1. Start the Application

**Local Development:**
```bash
cd phiseal
npm run web
```

Access at: http://localhost:8082

### 2. Set Your Intent

On first load, the intent modal appears with 4 preset options:
- Choose a preset that matches your review goal
- Or write a custom intent statement
- Define optional scope constraints
- Configure review constraints (toggles)

### 3. Upload a Document

- Click "Upload PDF/DOCX" button
- Or drag and drop a file onto the drop zone
- Supported formats: PDF, DOCX

### 4. Review Observations

The system will:
- Extract text from your document
- Send to Claude API with your intent
- Display neutral observations in the right panel

Each observation shows:
- Type (Ambiguity, Gap, Missing assumption, etc.)
- Reference (where in the document)
- Neutral description

### 5. Export Results

Click "Export" to download a JSON file containing:
- Your intent and constraints
- Document content
- All observations
- Review metadata

## API Documentation

### POST /api/analyze

Analyzes a document according to PhiSeal principles.

**Request Body:**
```json
{
  "file": "base64-encoded-file-content",
  "fileName": "document.pdf",
  "fileType": "pdf" | "docx",
  "intent": "Your review intent statement"
}
```

**Response:**
```json
{
  "success": true,
  "observations": [
    {
      "id": "obs-1234567890-0",
      "type": "Ambiguity",
      "reference": "Section 2",
      "text": "A key term is used as if defined earlier, but no definition is present.",
      "anchor": "ref-0"
    }
  ],
  "metadata": {
    "file_hash": "sha256-hash",
    "extraction_method": "pdf-parse_v1.0",
    "timestamp": "2026-01-01T12:00:00.000Z",
    "engine_version": "phiseal_v0.1",
    "intent": "Your review intent"
  }
}
```

## Design Constraints Enforced

### What PhiSeal Does NOT Do:
- ❌ Score or grade documents
- ❌ Provide recommendations
- ❌ Fill gaps with assumptions
- ❌ Add external facts
- ❌ Use confidence percentages
- ❌ Make judgments about quality
- ❌ Function as a chatbot

### What PhiSeal DOES Do:
- ✅ Surface structural uncertainty
- ✅ Flag ambiguities
- ✅ Identify missing assumptions
- ✅ Point to unresolved references
- ✅ Note internal tensions
- ✅ Stay within document boundaries
- ✅ Use neutral, diagnostic language
- ✅ Always cite source locations

## Visual Design

### Color Palette
- Background: `#0b0d12` (deep dark blue)
- Panel: `rgba(15,20,32,0.85)` (translucent dark)
- Lines: `rgba(255,255,255,0.10)` (subtle borders)
- Text: `rgba(255,255,255,0.92)` (high contrast)
- Muted: `rgba(255,255,255,0.70)` (secondary text)
- Accent: `#8ab4ff` (soft blue)

### Typography
- Sans-serif: System UI fonts
- Monospace: For tags and code
- Font sizes: 11px - 15px (deliberately modest)
- Line height: 1.35 - 1.65 (generous spacing)

### Layout Philosophy
- **Calm, not urgent**: No alerts, no gamification
- **Generous whitespace**: Room to think
- **Soft contrast**: Easy on the eyes
- **Clear hierarchy**: What matters is obvious
- **Motion only for state changes**: Minimal animation

## Future Enhancements

Potential additions (not yet implemented):
- PDF annotation overlays
- Section-level navigation
- Collaborative review features
- Custom observation templates
- Batch document processing
- Historical review comparison

## Philosophy in Practice

PhiSeal embodies the principle: **"Surface uncertainty without asserting conclusions."**

Every design decision asks: *"Does this help the user see what's structurally incomplete, or does it tell them what to think?"*

The interface reduces cognitive friction while preserving analytical rigor. It's a thinking space, not an answer engine.

## Deployment Status

✅ **Frontend**: Running on localhost:8082
✅ **Backend API**: https://phi-seal-code.vercel.app
✅ **Document Processing**: PDF.js + Mammoth
✅ **AI Analysis**: Claude Sonnet 4
✅ **Export**: JSON download

---

**Built with Claude Code**
Implementation Date: January 1, 2026
Version: 0.1.0
