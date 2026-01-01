/**
 * File Hashing Utility
 * Generates SHA-256 hash for document verification
 */

export async function generateFileHash(fileContent: string): Promise<string> {
  // For React Native, we'll use a crypto library
  // Convert the file content to array buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(fileContent);

  // Use SubtleCrypto API (available in modern environments)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
