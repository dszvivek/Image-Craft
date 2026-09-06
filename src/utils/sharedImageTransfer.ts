/**
 * Shared In-Memory Image Transfer Bridge
 * Allows the Home hero dropzone to seamlessly hand off a dropped/selected image
 * to any tool page upon launch without re-uploading or serializing large binary blobs.
 */

let pendingTransferFile: File | null = null;
let transferTimestamp: number = 0;

// Expiration time for pending transfer (5 minutes max)
const MAX_TRANSFER_LIFETIME_MS = 5 * 60 * 1000;

export const setPendingTransferFile = (file: File): void => {
  pendingTransferFile = file;
  transferTimestamp = Date.now();
};

export const popPendingTransferFile = (): File | null => {
  if (!pendingTransferFile) return null;

  // Check expiration to prevent stale files from unexpected routes
  if (Date.now() - transferTimestamp > MAX_TRANSFER_LIFETIME_MS) {
    pendingTransferFile = null;
    return null;
  }

  const file = pendingTransferFile;
  pendingTransferFile = null;
  return file;
};

export const peekPendingTransferFile = (): File | null => {
  if (!pendingTransferFile) return null;
  if (Date.now() - transferTimestamp > MAX_TRANSFER_LIFETIME_MS) {
    pendingTransferFile = null;
    return null;
  }
  return pendingTransferFile;
};

export const clearPendingTransferFile = (): void => {
  pendingTransferFile = null;
  transferTimestamp = 0;
};
