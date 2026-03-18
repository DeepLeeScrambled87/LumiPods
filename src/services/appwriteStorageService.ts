import {
  appwriteBucketFilesUrl,
  appwriteConfig,
  appwriteFileUrl,
  appwriteFileViewUrl,
  isAppwriteStorageConfigured,
} from '../lib/appwrite';

const APPWRITE_CHUNK_SIZE = 5 * 1024 * 1024;

interface UploadedAppwriteArtifactFile {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  url: string;
}

const parseResponseBody = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Appwrite storage returned a non-JSON response (${response.status}).`);
  }
};

const createFileId = (): string =>
  `art${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const uploadSingleRequest = async (
  file: File,
  fileId: string,
  headers: Record<string, string>
): Promise<Record<string, unknown>> => {
  const form = new FormData();
  form.set('fileId', fileId);
  form.set('file', file, file.name);

  const response = await fetch(appwriteBucketFilesUrl(), {
    method: 'POST',
    headers,
    body: form,
    credentials: 'include',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Appwrite file upload failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return parseResponseBody(response);
};

const uploadChunked = async (
  file: File,
  fileId: string,
  headers: Record<string, string>
): Promise<Record<string, unknown>> => {
  let uploadedBytes = 0;
  let lastPayload: Record<string, unknown> = {};

  while (uploadedBytes < file.size) {
    const nextByte = Math.min(uploadedBytes + APPWRITE_CHUNK_SIZE, file.size);
    const chunk = file.slice(uploadedBytes, nextByte, file.type || 'application/octet-stream');
    const form = new FormData();
    form.set('fileId', fileId);
    form.set('file', chunk, file.name);

    const response = await fetch(appwriteBucketFilesUrl(), {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Range': `bytes ${uploadedBytes}-${nextByte - 1}/${file.size}`,
        ...(uploadedBytes > 0 ? { 'X-Appwrite-ID': fileId } : {}),
      },
      body: form,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Appwrite chunk upload failed (${response.status}): ${text.slice(0, 300)}`);
    }

    lastPayload = await parseResponseBody(response);
    uploadedBytes = nextByte;
  }

  return lastPayload;
};

export const uploadArtifactFileToAppwrite = async (
  file: File,
  preferredFileId?: string
): Promise<UploadedAppwriteArtifactFile> => {
  if (!isAppwriteStorageConfigured()) {
    throw new Error('Appwrite storage is not configured.');
  }

  const fileId = preferredFileId || createFileId();
  const headers: Record<string, string> = {
    'X-Appwrite-Project': appwriteConfig.projectId,
  };

  const payload =
    file.size > APPWRITE_CHUNK_SIZE
      ? await uploadChunked(file, fileId, headers)
      : await uploadSingleRequest(file, fileId, headers);

  return {
    fileId: String(payload.$id || fileId),
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || undefined,
    url: appwriteFileViewUrl(String(payload.$id || fileId)),
  };
};

export const deleteArtifactFileFromAppwrite = async (fileId: string): Promise<void> => {
  if (!fileId || !isAppwriteStorageConfigured()) {
    return;
  }

  const response = await fetch(appwriteFileUrl(fileId), {
    method: 'DELETE',
    headers: {
      'X-Appwrite-Project': appwriteConfig.projectId,
    },
    credentials: 'include',
  });

  if (response.ok || response.status === 404) {
    return;
  }

  const text = await response.text();
  throw new Error(`Appwrite file delete failed (${response.status}): ${text.slice(0, 300)}`);
};
