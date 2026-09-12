import { storage, sRef, uploadBytesResumable, getDownloadURL, deleteObject } from './firebase.js';

const MAX_IMAGE = 8 * 1024 * 1024;      // 8MB
const MAX_VIDEO = 50 * 1024 * 1024;     // 50MB
const MAX_FILE  = 25 * 1024 * 1024;     // 25MB
const MAX_AUDIO = 10 * 1024 * 1024;     // 10MB

export function detectType(file) {
  const t = file.type || '';
  if (t.startsWith('image/')) return 'image';
  if (t.startsWith('video/')) return 'video';
  if (t.startsWith('audio/')) return 'audio';
  return 'file';
}

export function validateFile(file, type) {
  if (type === 'image' && file.size > MAX_IMAGE) throw new Error('Gambar maksimal 8MB.');
  if (type === 'video' && file.size > MAX_VIDEO) throw new Error('Video maksimal 50MB.');
  if (type === 'audio' && file.size > MAX_AUDIO) throw new Error('Audio maksimal 10MB.');
  if (type === 'file'  && file.size > MAX_FILE)  throw new Error('File maksimal 25MB.');
  // Block dangerous extensions
  const dangerous = /\.(html?|js|mjs|jsx|ts|tsx|php|asp|aspx|jsp|sh|bat|exe|dll|scr|vbs|ps1|jar)$/i;
  if (dangerous.test(file.name)) throw new Error('Tipe file tidak diizinkan untuk keamanan.');
  return true;
}

export function uploadFile(path, file, onProgress) {
  return new Promise((resolve, reject) => {
    const r = sRef(storage, path);
    const task = uploadBytesResumable(r, file, { contentType: file.type || 'application/octet-stream' });
    task.on('state_changed',
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        onProgress && onProgress(pct);
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path, size: file.size, name: file.name, type: file.type });
        } catch (e) { reject(e); }
      }
    );
  });
}

export async function deleteFileByUrl(url) {
  try {
    const r = sRef(storage, url);
    await deleteObject(r);
  } catch (e) { console.warn('Delete file failed:', e); }
}
