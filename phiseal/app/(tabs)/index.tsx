import { StyleSheet, View, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as DocumentPicker from 'expo-document-picker';

type Intent = {
  text: string;
  scope: string;
  stayInDoc: boolean;
  noVerdict: boolean;
  citeSpans: boolean;
};

type Observation = {
  id: string;
  type: string;
  reference: string;
  text: string;
  anchor: string;
};

export default function ReviewWorkspace() {
  const [intentModalVisible, setIntentModalVisible] = useState(true);
  const [intent, setIntent] = useState<Intent>({
    text: '',
    scope: '',
    stayInDoc: true,
    noVerdict: true,
    citeSpans: true,
  });
  const [currentMode, setCurrentMode] = useState('Reviewing');
  const [modeText, setModeText] = useState('for missing assumptions and gaps');
  const [documentName, setDocumentName] = useState('No document loaded');
  const [documentContent, setDocumentContent] = useState('');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [statusText, setStatusText] = useState('Status: Set intent first, then load a document.');

  const presets = {
    'missing-assumptions': {
      text: "I want to identify missing assumptions, undefined terms, and leaps in reasoning. Stay within the document and point to the exact spans that trigger each observation.",
      mode: 'for missing assumptions and gaps'
    },
    'external-review': {
      text: "I want to prepare this document for external review. Please surface ambiguities, traceability gaps, and any claims that lack internal support. Always reference where each issue appears.",
      mode: 'for external review / audit readiness'
    },
    'reasoning-review': {
      text: "I want a structured review of the reasoning in this document: claims, supports, internal consistency, and implied premises. No scoring and no verdict language.",
      mode: 'for reasoning structure and internal support'
    },
    'not-settling': {
      text: "I want to diagnose why this argument or decision is not settling. Please surface competing frames, missing criteria, unresolved tradeoffs, and ambiguity clusters, with span references.",
      mode: 'for why the argument is not settling'
    }
  };

  const applyPreset = (presetKey: keyof typeof presets) => {
    const preset = presets[presetKey];
    setIntent({ ...intent, text: preset.text });
    setModeText(preset.mode);
    setStatusText('Status: Intent applied. Load a document to begin analysis.');
    setIntentModalVisible(false);
  };

  const handleExport = () => {
    if (Platform.OS !== 'web') return;

    const exportData = {
      metadata: {
        documentName,
        timestamp: new Date().toISOString(),
        intent: intent.text,
        scope: intent.scope,
      },
      constraints: {
        stayInDoc: intent.stayInDoc,
        noVerdict: intent.noVerdict,
        citeSpans: intent.citeSpans,
      },
      documentContent,
      observations,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phiseal-review-${documentName.replace(/\.[^/.]+$/, '')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStatusText('Status: Review exported successfully.');
  };

  const handleNewReview = () => {
    setDocumentName('No document loaded');
    setDocumentContent('');
    setObservations([]);
    setIntent({
      text: '',
      scope: '',
      stayInDoc: true,
      noVerdict: true,
      citeSpans: true,
    });
    setModeText('for missing assumptions and gaps');
    setStatusText('Status: New review started. Set intent and load a document.');
    setIntentModalVisible(true);
  };

  const handleDocumentPick = async () => {
    try {
      if (Platform.OS !== 'web') {
        setStatusText('Status: Document upload is only available on web.');
        return;
      }

      // Create a file input element for web
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.docx';

      input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        setDocumentName(file.name);
        setStatusText('Status: Processing document...');

        try {
          // Process the document
          const { processDocument } = await import('../../services/documentProcessor');
          const processed = await processDocument(file);

          setDocumentContent(processed.text);
          setStatusText(`Status: Document loaded (${processed.metadata.wordCount} words). Analyzing...`);

          // Call analysis API if intent is set
          if (intent.text) {
            await analyzeDocument(file, processed.text);
          } else {
            setStatusText('Status: Document loaded. Set an intent to begin analysis.');
          }
        } catch (error: any) {
          console.error('Document processing error:', error);
          setStatusText(`Status: Error - ${error.message}`);
        }
      };

      input.click();
    } catch (error) {
      console.error('Error picking document:', error);
      setStatusText('Status: Error loading document.');
    }
  };

  const analyzeDocument = async (file: File, documentText: string) => {
    try {
      setStatusText('Status: Analyzing document with Claude...');

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Determine file type
      const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'docx';

      // Call API
      const response = await fetch('https://phi-seal-code.vercel.app/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          fileType,
          intent: intent.text,
        }),
      });

      const data = await response.json();

      if (data.success && data.observations) {
        setObservations(data.observations);
        setStatusText(`Status: Analysis complete. ${data.observations.length} observations found.`);
      } else {
        setStatusText('Status: Analysis completed but no observations were generated.');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setStatusText(`Status: Analysis error - ${error.message}`);
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.notWebText}>
          PhiSeal review workspace is optimized for web.{'\n\n'}
          Please use `npm run web` to access the full interface.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.app}>
      {/* Top Bar */}
      <View style={styles.topbar}>
        <View style={styles.brand}>
          <View style={styles.logo} />
          <View style={styles.brandTitle}>
            <ThemedText style={styles.brandTitleStrong}>PhiSeal</ThemedText>
            <ThemedText style={styles.brandTitleSpan}>Review workspace</ThemedText>
          </View>
        </View>

        <View style={styles.modePill}>
          <View style={styles.dot} />
          <ThemedText style={styles.modePillText}>
            <ThemedText style={styles.modePillBold}>{currentMode}</ThemedText>: {modeText}
          </ThemedText>
        </View>

        <View style={styles.topActions}>
          <Pressable style={styles.btn} onPress={handleNewReview}>
            <ThemedText style={styles.btnText}>New review</ThemedText>
          </Pressable>
          <Pressable style={styles.btn} onPress={handleExport}>
            <ThemedText style={styles.btnText}>Export</ThemedText>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setIntentModalVisible(true)}>
            <ThemedText style={styles.btnText}>Set intent</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Main Grid */}
      <View style={styles.main}>
        {/* Left Rail */}
        <ScrollView style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemedText style={styles.panelHeaderTitle}>What are you trying to understand?</ThemedText>
            <ThemedText style={styles.panelHeaderText}>
              State your intent and constraints. PhiSeal will surface structural uncertainty without asserting conclusions.
            </ThemedText>
          </View>
          <View style={styles.panelBody}>
            <View style={styles.field}>
              <ThemedText style={styles.label}>Intent statement</ThemedText>
              <TextInput
                style={styles.textarea}
                placeholder="Example: I want to know whether this argument relies on unstated assumptions..."
                placeholderTextColor="rgba(255,255,255,0.40)"
                multiline
                numberOfLines={4}
                value={intent.text}
                onChangeText={(text) => setIntent({ ...intent, text })}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Scope (optional)</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Example: Focus on sections 2–4, ignore appendices."
                placeholderTextColor="rgba(255,255,255,0.40)"
                value={intent.scope}
                onChangeText={(text) => setIntent({ ...intent, scope: text })}
              />
            </View>

            <View style={styles.toggle}>
              <Pressable onPress={() => setIntent({ ...intent, stayInDoc: !intent.stayInDoc })}>
                <View style={[styles.checkbox, intent.stayInDoc && styles.checkboxChecked]} />
              </Pressable>
              <View style={styles.toggleContent}>
                <ThemedText style={styles.toggleStrong}>Stay within the document</ThemedText>
                <ThemedText style={styles.toggleSpan}>
                  Do not introduce external facts or new claims. Flag unknowns explicitly.
                </ThemedText>
              </View>
            </View>

            <View style={styles.toggle}>
              <Pressable onPress={() => setIntent({ ...intent, noVerdict: !intent.noVerdict })}>
                <View style={[styles.checkbox, intent.noVerdict && styles.checkboxChecked]} />
              </Pressable>
              <View style={styles.toggleContent}>
                <ThemedText style={styles.toggleStrong}>No verdict language</ThemedText>
                <ThemedText style={styles.toggleSpan}>
                  Prefer "unclear / unsupported / unspecified" over judgment or scoring.
                </ThemedText>
              </View>
            </View>

            <View style={styles.toggle}>
              <Pressable onPress={() => setIntent({ ...intent, citeSpans: !intent.citeSpans })}>
                <View style={[styles.checkbox, intent.citeSpans && styles.checkboxChecked]} />
              </Pressable>
              <View style={styles.toggleContent}>
                <ThemedText style={styles.toggleStrong}>Always point to source spans</ThemedText>
                <ThemedText style={styles.toggleSpan}>
                  Each observation should identify where it appears in the document.
                </ThemedText>
              </View>
            </View>

            <View style={styles.hint}>
              <ThemedText style={styles.hintText}>
                Tip: Treat this like instructing a meticulous reviewer. The more precise the constraints, the more stable the analysis.
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        {/* Center Plane */}
        <View style={[styles.panel, styles.centerPlane]}>
          <View style={styles.docToolbar}>
            <View style={styles.docTitle}>
              <ThemedText style={styles.docTitleStrong}>{documentName}</ThemedText>
              <ThemedText style={styles.docTitleSpan}>
                {documentContent ? 'The document remains the primary object of review.' : 'Upload a PDF or DOCX to begin.'}
              </ThemedText>
            </View>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={handleDocumentPick}>
              <ThemedText style={styles.btnText}>Upload PDF/DOCX</ThemedText>
            </Pressable>
          </View>

          {!documentContent ? (
            <View style={styles.dropZone}>
              <ThemedText style={styles.dropText}>
                <ThemedText style={styles.dropBold}>Drop a PDF or DOCX</ThemedText> here
              </ThemedText>
              <ThemedText style={styles.dropSubtext}>
                or use <ThemedText style={styles.kbd}>Upload</ThemedText> to choose a file
              </ThemedText>
            </View>
          ) : (
            <ScrollView style={styles.docView}>
              <View style={styles.docPaper}>
                <ThemedText style={styles.docContent}>{documentContent}</ThemedText>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Right Rail */}
        <ScrollView style={styles.panel}>
          <View style={styles.panelHeader}>
            <ThemedText style={styles.panelHeaderTitle}>What the system is noticing</ThemedText>
            <ThemedText style={styles.panelHeaderText}>
              Neutral observations: ambiguities, gaps, and tensions. No scoring. No verdicts.
            </ThemedText>
          </View>
          <View style={styles.panelBody}>
            {observations.length === 0 ? (
              <ThemedText style={styles.placeholderText}>
                Observations will appear here once you upload a document and analysis begins.
              </ThemedText>
            ) : (
              <View style={styles.obsList}>
                {observations.map((obs) => (
                  <View key={obs.id} style={styles.obsItem}>
                    <View style={styles.obsMeta}>
                      <View style={styles.tag}>
                        <ThemedText style={styles.tagText}>{obs.type}</ThemedText>
                      </View>
                      <ThemedText style={styles.obsRef}>{obs.reference}</ThemedText>
                    </View>
                    <ThemedText style={styles.obsText}>{obs.text}</ThemedText>
                    <View style={styles.obsActions}>
                      <Pressable style={[styles.btn, styles.btnMini]}>
                        <ThemedText style={styles.btnText}>Jump</ThemedText>
                      </Pressable>
                      <Pressable style={[styles.btn, styles.btnMini]}>
                        <ThemedText style={styles.btnText}>Ask a question</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottombar}>
        <ThemedText style={styles.statusText}>{statusText}</ThemedText>
        <ThemedText style={styles.kbdHint}>
          <ThemedText style={styles.kbd}>Ctrl</ThemedText> + <ThemedText style={styles.kbd}>K</ThemedText> for commands
        </ThemedText>
      </View>

      {/* Intent Modal */}
      {intentModalVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Start with intent</ThemedText>
              <ThemedText style={styles.modalText}>
                PhiSeal does not begin by "answering." It begins by adopting your constraints and surfacing what may be structurally incomplete. Choose a review posture and refine it in your own words.
              </ThemedText>
            </View>

            <View style={styles.modalBody}>
              <Pressable style={styles.card} onPress={() => applyPreset('missing-assumptions')}>
                <ThemedText style={styles.cardTitle}>Check for missing assumptions or gaps</ThemedText>
                <ThemedText style={styles.cardText}>
                  Surface unstated premises, leaps of logic, undefined terms, and missing dependencies.
                </ThemedText>
              </Pressable>

              <Pressable style={styles.card} onPress={() => applyPreset('external-review')}>
                <ThemedText style={styles.cardTitle}>Prepare material for external review or audit</ThemedText>
                <ThemedText style={styles.cardText}>
                  Prioritize traceability: explicit references, scope boundaries, and unresolved claims.
                </ThemedText>
              </Pressable>

              <Pressable style={styles.card} onPress={() => applyPreset('reasoning-review')}>
                <ThemedText style={styles.cardTitle}>Review reasoning in a document</ThemedText>
                <ThemedText style={styles.cardText}>
                  Focus on argument structure: claims, support, internal consistency, and implied assumptions.
                </ThemedText>
              </Pressable>

              <Pressable style={styles.card} onPress={() => applyPreset('not-settling')}>
                <ThemedText style={styles.cardTitle}>Diagnose why a decision or argument is not settling</ThemedText>
                <ThemedText style={styles.cardText}>
                  Surface competing frames, missing criteria, unresolved tradeoffs, and ambiguity clusters.
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.modalFooter}>
              <ThemedText style={styles.modalFooterText}>
                You can edit the intent later. The system should remain inside your stated constraints.
              </ThemedText>
              <View style={styles.modalFooterActions}>
                <Pressable style={styles.btn} onPress={() => setIntentModalVisible(false)}>
                  <ThemedText style={styles.btnText}>Not now</ThemedText>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setIntentModalVisible(false)}>
                  <ThemedText style={styles.btnText}>Apply intent</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#0b0d12',
    minHeight: 680,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notWebText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 24,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(15,20,32,0.92)',
    height: 64,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 240,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#8ab4ff',
  },
  brandTitle: {
    gap: 2,
  },
  brandTitleStrong: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  brandTitleSpan: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    maxWidth: 520,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8ab4ff',
  },
  modePillText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  modePillBold: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 240,
    justifyContent: 'flex-end',
  },
  btn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnPrimary: {
    borderColor: 'rgba(138,180,255,0.40)',
    backgroundColor: 'rgba(138,180,255,0.10)',
  },
  btnMini: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  btnText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.92)',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  panel: {
    flex: 1,
    backgroundColor: 'rgba(15,20,32,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  centerPlane: {
    flex: 2,
  },
  panelHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  panelHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  panelHeaderText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 16,
  },
  panelBody: {
    padding: 14,
  },
  field: {
    gap: 8,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  textarea: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: 'rgba(255,255,255,0.92)',
    padding: 10,
    fontSize: 13,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  input: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: 'rgba(255,255,255,0.92)',
    padding: 10,
    fontSize: 13,
  },
  toggle: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#8ab4ff',
    borderColor: '#8ab4ff',
  },
  toggleContent: {
    flex: 1,
  },
  toggleStrong: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleSpan: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 16,
  },
  hint: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  hintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 16,
  },
  docToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  docTitle: {
    flex: 1,
    gap: 4,
  },
  docTitleStrong: {
    fontSize: 13,
    fontWeight: '600',
  },
  docTitleSpan: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  dropZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 14,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.20)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dropText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 8,
  },
  dropBold: {
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  dropSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  kbd: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  docView: {
    flex: 1,
    padding: 18,
  },
  docPaper: {
    maxWidth: 860,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 22,
  },
  docContent: {
    fontSize: 13,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.92)',
  },
  placeholderText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 18,
  },
  obsList: {
    gap: 10,
  },
  obsItem: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
  },
  obsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
  },
  obsRef: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.70)',
  },
  obsText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 10,
  },
  obsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bottombar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 0,
    height: 48,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(13,17,26,0.75)',
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  kbdHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modal: {
    width: '100%',
    maxWidth: 760,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(15,20,32,0.98)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.10)',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 17,
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    minHeight: 100,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 17,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFooterText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.70)',
    lineHeight: 16,
    marginRight: 12,
  },
  modalFooterActions: {
    flexDirection: 'row',
    gap: 10,
  },
});
