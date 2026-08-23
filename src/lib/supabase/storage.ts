// Label Ledger — Supabase Storage Service Layer (Private Bucket: label-evidence)
import { createClient } from './client';
import { getCurrentUser } from './auth';

export const BUCKET_LABEL_EVIDENCE = 'label-evidence';

export interface UploadLabelEvidenceOptions {
  inspectionId: string;
  file: File | Blob | ArrayBuffer | Buffer;
  fileName: string;
  contentType?: string;
}

export interface StorageOperationResult<T = string> {
  data: T | null;
  error: string | null;
}

/**
 * Uploads a label evidence image file to the private label-evidence storage bucket.
 * Target path convention: {inspection_id}/{filename}
 */
export async function uploadLabelEvidence({
  inspectionId,
  file,
  fileName,
  contentType = 'image/jpeg',
}: UploadLabelEvidenceOptions): Promise<StorageOperationResult<string>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    if (!inspectionId || !fileName) {
      return { data: null, error: 'Inspection ID and file name are required.' };
    }

    // Sanitize filename and construct path
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${inspectionId}/${sanitizedFileName}`;

    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_LABEL_EVIDENCE)
      .upload(storagePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data.path, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'An unexpected error occurred during file upload.' };
  }
}

/**
 * Generates a temporary signed URL for viewing or downloading a private label evidence object.
 * Defaults to 60 minutes (3600 seconds) expiration.
 */
export async function createLabelEvidenceSignedUrl(
  path: string,
  expiresInSeconds: number = 3600
): Promise<StorageOperationResult<string>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    if (!path) {
      return { data: null, error: 'Storage path is required.' };
    }

    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_LABEL_EVIDENCE)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return { data: null, error: error?.message || 'Failed to generate signed URL.' };
    }

    return { data: data.signedUrl, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'An unexpected error occurred generating signed URL.' };
  }
}

/**
 * Generates temporary signed URLs for multiple private label evidence objects in a batch.
 */
export async function createLabelEvidenceSignedUrls(
  paths: string[],
  expiresInSeconds: number = 3600
): Promise<StorageOperationResult<Record<string, string>>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: null, error: 'User is not authenticated.' };
    }

    if (!paths || paths.length === 0) {
      return { data: {}, error: null };
    }

    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_LABEL_EVIDENCE)
      .createSignedUrls(paths, expiresInSeconds);

    if (error || !data) {
      return { data: null, error: error?.message || 'Failed to generate signed URLs.' };
    }

    const signedUrlMap: Record<string, string> = {};
    data.forEach((item) => {
      if (item.path && item.signedUrl) {
        signedUrlMap[item.path] = item.signedUrl;
      }
    });

    return { data: signedUrlMap, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'An unexpected error occurred generating signed URLs.' };
  }
}

/**
 * Deletes a label evidence object from the private label-evidence storage bucket.
 */
export async function deleteLabelEvidence(
  path: string
): Promise<StorageOperationResult<boolean>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { data: false, error: 'User is not authenticated.' };
    }

    if (!path) {
      return { data: false, error: 'Storage path is required.' };
    }

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(BUCKET_LABEL_EVIDENCE)
      .remove([path]);

    if (error) {
      return { data: false, error: error.message };
    }

    return { data: true, error: null };
  } catch (err: any) {
    return { data: false, error: err.message || 'An unexpected error occurred during object deletion.' };
  }
}
