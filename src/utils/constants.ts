
export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  uploading: 'bg-blue-100 text-blue-800',
  uploaded: 'bg-blue-100 text-blue-800',
  classifying: 'bg-yellow-100 text-yellow-800',
  classified: 'bg-green-100 text-green-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-800',
};
export const STATUS_STYLE = STATUS_STYLES;
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
export const ALLOWED_EXTS = ['.xlsx', '.xlsm'];
