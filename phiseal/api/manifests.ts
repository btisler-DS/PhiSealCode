/**
 * PhiSeal Manifest Storage API
 * Stores analysis manifests for audit trail
 * Vercel Serverless Function with Vercel KV (Redis)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory storage for MVP (will be replaced with Vercel KV later)
// In production, use Vercel KV or another persistent storage
const manifestStore = new Map<string, any>();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST': {
        // Store a new manifest
        const { manifest } = req.body;

        if (!manifest || !manifest.manifest) {
          return res.status(400).json({ error: 'Invalid manifest data' });
        }

        const id = `manifest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const storedManifest = {
          id,
          ...manifest,
          storedAt: new Date().toISOString(),
        };

        manifestStore.set(id, storedManifest);

        return res.status(201).json({
          success: true,
          id,
          manifest: storedManifest,
        });
      }

      case 'GET': {
        // Retrieve manifest(s)
        const { id } = req.query;

        if (id && typeof id === 'string') {
          // Get specific manifest
          const manifest = manifestStore.get(id);

          if (!manifest) {
            return res.status(404).json({ error: 'Manifest not found' });
          }

          return res.status(200).json({
            success: true,
            manifest,
          });
        } else {
          // Get all manifests (limited to last 50)
          const allManifests = Array.from(manifestStore.values())
            .sort((a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime())
            .slice(0, 50);

          return res.status(200).json({
            success: true,
            manifests: allManifests,
            count: allManifests.length,
          });
        }
      }

      case 'DELETE': {
        // Delete a manifest
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'Missing manifest ID' });
        }

        const deleted = manifestStore.delete(id);

        if (!deleted) {
          return res.status(404).json({ error: 'Manifest not found' });
        }

        return res.status(200).json({
          success: true,
          message: 'Manifest deleted',
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error: any) {
    console.error('Manifest storage error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Storage operation failed',
    });
  }
}
