const APPWRITE_ENDPOINT = (import.meta.env.VITE_APPWRITE_ENDPOINT || '').replace(/\/$/, '');
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'lumipods';
const APPWRITE_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'learner-artifacts';

export const appwriteConfig = {
  endpoint: APPWRITE_ENDPOINT,
  projectId: APPWRITE_PROJECT_ID,
  databaseId: APPWRITE_DATABASE_ID,
  bucketId: APPWRITE_BUCKET_ID,
};

export const isAppwriteConfigured = (): boolean =>
  Boolean(appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.databaseId);

export const isAppwriteStorageConfigured = (): boolean =>
  Boolean(appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.bucketId);

export const appwriteDocumentUrl = (collectionId: string, documentId: string): string =>
  `${appwriteConfig.endpoint}/databases/${appwriteConfig.databaseId}/collections/${collectionId}/documents/${documentId}`;

export const appwriteCollectionUrl = (collectionId: string): string =>
  `${appwriteConfig.endpoint}/databases/${appwriteConfig.databaseId}/collections/${collectionId}/documents`;

export const appwriteBucketFilesUrl = (): string =>
  `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files`;

export const appwriteFileUrl = (fileId: string): string =>
  `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${fileId}`;

export const appwriteFileViewUrl = (fileId: string): string =>
  `${appwriteFileUrl(fileId)}/view?project=${appwriteConfig.projectId}`;

export const appwriteHeaders = (): Record<string, string> => ({
  'X-Appwrite-Project': appwriteConfig.projectId,
  'Content-Type': 'application/json',
});
