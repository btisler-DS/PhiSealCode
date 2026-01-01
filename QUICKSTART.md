# PhiSeal Quick Start Guide

## Getting Started in 3 Steps

### 1. Start the Application
```bash
cd phiseal
npm run web
```
Open http://localhost:8082 in your browser.

### 2. Set Your Intent
Choose one of the 4 review modes:
- ✦ Missing assumptions & gaps
- ✦ External review readiness
- ✦ Reasoning structure
- ✦ Decision diagnosis

### 3. Upload & Analyze
- Upload a PDF or DOCX
- Watch observations appear
- Export results when done

## What You'll See

**The Intent Modal (First Time)**
```
┌─────────────────────────────────────┐
│ Start with intent                   │
│                                     │
│ Choose a review posture:            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Check for missing assumptions   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Prepare for external review     │ │
│ └─────────────────────────────────┘ │
│                                     │
│          [Not now] [Apply]          │
└─────────────────────────────────────┘
```

**Main Workspace**
```
┌──────────────────────────────────────────────────────────┐
│ PhiSeal      Reviewing: for gaps      [New] [Export] [Intent] │
├─────────────┬────────────────────────┬──────────────────┤
│ Intent      │   Document Plane       │  Observations    │
│             │                        │                  │
│ What are    │   [Your document       │  What the        │
│ you trying  │    appears here]       │  system is       │
│ to          │                        │  noticing        │
│ understand? │   Clean reading        │                  │
│             │   surface with         │  • Ambiguity     │
│ [Intent]    │   your uploaded        │  • Gap           │
│ [Scope]     │   PDF or DOCX          │  • Assumption    │
│             │                        │                  │
│ ☑ Stay in   │                        │  (Neutral        │
│   document  │                        │   observations)  │
│ ☑ No        │                        │                  │
│   verdicts  │                        │                  │
│ ☑ Cite      │                        │                  │
│   sources   │                        │                  │
└─────────────┴────────────────────────┴──────────────────┘
```

## Example Review Flow

**1. Set Intent**
```
Intent: "I want to identify missing assumptions and
undefined terms in this policy document."

Scope: "Focus on sections 3-5, ignore appendices."
```

**2. Upload Document**
- Choose `policy-draft.pdf`
- System extracts text
- Claude analyzes based on your intent

**3. Review Observations**
```
┌────────────────────────────────────────┐
│ Ambiguity          Ref: Section 3      │
│                                        │
│ "The term 'reasonable timeframe' is    │
│ used without definition."              │
│                                        │
│ [Jump] [Ask a question]                │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Missing assumption    Ref: Section 4   │
│                                        │
│ "This conclusion appears to assume     │
│ stakeholder alignment, but no evidence │
│ of that alignment is provided."        │
│                                        │
│ [Jump] [Ask a question]                │
└────────────────────────────────────────┘
```

**4. Export**
Downloads: `phiseal-review-policy-draft-1735689600000.json`

## Key Principles to Remember

### PhiSeal IS:
- 🎯 A diagnostic lens for documents
- 🔍 A structural uncertainty detector
- 📊 A neutral observation system
- 📝 A review workspace

### PhiSeal IS NOT:
- ❌ A grading tool
- ❌ An answer engine
- ❌ A recommendation system
- ❌ A chatbot

## Language You'll See

PhiSeal uses **neutral, diagnostic language**:

✅ Good Examples:
- "This term is used but not defined"
- "No evidence is provided for this claim"
- "The causal link is not established"
- "These two statements appear to conflict"

❌ Not Used:
- "This is weak/strong"
- "Score: 7/10"
- "High confidence"
- "You should..."

## Constraints Explained

**☑ Stay within the document**
- No external facts added
- Unknowns are flagged, not filled
- Only what's in the document matters

**☑ No verdict language**
- No "good" or "bad"
- No scoring or ranking
- Prefer "unclear" over judgment

**☑ Always point to source spans**
- Every observation references a location
- Section numbers, page numbers, paragraphs
- Traceability is essential

## Troubleshooting

**Document won't upload?**
- Make sure it's a PDF or DOCX
- Check file size (keep under 10MB for best performance)
- Try refreshing the page

**No observations appearing?**
- Check that intent is set
- Verify document was processed successfully
- Look at status bar for messages

**Observations seem too general?**
- Refine your intent statement
- Add specific scope constraints
- Use more precise language

## Example Intents

**For Policy Documents:**
```
I want to identify undefined terms, unstated assumptions,
and any policy statements that lack supporting rationale.
Stay within the document and flag all ambiguities.
```

**For Research Papers:**
```
Review this paper's reasoning structure: identify claims
that lack empirical support, undefined methodology terms,
and any leaps in logic between sections.
```

**For Legal Documents:**
```
Surface any ambiguous phrasing, undefined terms, missing
precedent citations, and contractual obligations that
lack clear scope or timeframes.
```

**For Technical Specs:**
```
Identify missing requirements, undefined technical terms,
contradictions between sections, and any assumptions
about implementation that are not explicitly stated.
```

## Tips for Best Results

1. **Be specific in your intent**
   - Generic: "Review this document"
   - Better: "Identify missing assumptions in the risk analysis section"

2. **Use scope to focus analysis**
   - "Focus on sections 2-4"
   - "Ignore appendices and references"
   - "Prioritize the executive summary"

3. **Enable relevant constraints**
   - Always keep "Stay within document" on
   - Use "Cite spans" for traceability
   - Keep "No verdicts" on for neutral language

4. **Export early, export often**
   - Save reviews as you go
   - Compare analyses over document revisions
   - Share JSON exports with team members

## Next Steps

Once you're comfortable with basic reviews:
- Try different intent modes
- Experiment with scope constraints
- Compare observations across document versions
- Use exports for documentation

---

**Need Help?**
See `PHISEAL_IMPLEMENTATION.md` for full technical documentation.

**Philosophy:**
PhiSeal surfaces uncertainty without asserting conclusions.
It's a thinking space, not an answer engine.
