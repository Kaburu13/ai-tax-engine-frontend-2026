import { ALLOWED_EXTS, MAX_UPLOAD_BYTES } from './constants';
import { formatFileSize } from './format';

export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { valid: false, error: `File too large (${formatFileSize(file.size)}). Max ${formatFileSize(MAX_UPLOAD_BYTES)}.` };
  }
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!ALLOWED_EXTS.includes(ext)) {
    return { valid: false, error: `Only ${ALLOWED_EXTS.join(', ')} files are allowed.` };
  }
  return { valid: true };
}
