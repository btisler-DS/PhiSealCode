/**
 * PhiSeal API Client
 * Handles communication with Vercel serverless functions
 */

import type {
  AnalysisRequest,
  AnalysisResponse,
  Manifest,
  StoredManifest,
  IntentType,
} from '../types/manifest';

// API base URL - will be updated after Vercel deployment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Analyze a document using the PhiSeal HDT² framework
 */
export async function analyzeDocument(
  fileUri: string,
  fileName: string,
  fileType: 'pdf' | 'docx',
  intent: IntentType
): Promise<AnalysisResponse> {
  try {
    // Read file and convert to base64
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);

    const requestBody: AnalysisRequest = {
      file: base64,
      fileName,
      fileType,
      intent,
    };

    const apiResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    const data: AnalysisResponse = await apiResponse.json();
    return data;
  } catch (error: any) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze document',
      manifest: {
        manifest: {
          file_hash: '',
          extraction_method: '',
          timestamp: '',
          engine_version: 'phiseal_v0.1',
          intent,
        },
        analysis: {
          delta: [],
          assumptions: [],
          conflicts: [],
        },
      },
    };
  }
}

/**
 * Store a manifest on the server for audit trail
 */
export async function storeManifest(manifest: Manifest): Promise<StoredManifest | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manifests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ manifest }),
    });

    if (!response.ok) {
      throw new Error('Failed to store manifest');
    }

    const data = await response.json();
    return data.manifest;
  } catch (error: any) {
    console.error('Manifest storage error:', error);
    return null;
  }
}

/**
 * Retrieve a stored manifest by ID
 */
export async function getManifest(id: string): Promise<StoredManifest | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manifests?id=${id}`);

    if (!response.ok) {
      throw new Error('Failed to retrieve manifest');
    }

    const data = await response.json();
    return data.manifest;
  } catch (error: any) {
    console.error('Manifest retrieval error:', error);
    return null;
  }
}

/**
 * Retrieve all stored manifests
 */
export async function getAllManifests(): Promise<StoredManifest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/manifests`);

    if (!response.ok) {
      throw new Error('Failed to retrieve manifests');
    }

    const data = await response.json();
    return data.manifests || [];
  } catch (error: any) {
    console.error('Manifests retrieval error:', error);
    return [];
  }
}

/**
 * Helper function to convert Blob to base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove data URL prefix
      const base64 = base64data.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
