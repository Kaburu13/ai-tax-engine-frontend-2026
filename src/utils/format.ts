export const formatFileSize = (bytes = 0) => {
  const k = 1024, sizes = ['Bytes','KB','MB','GB'];
  const i = Math.floor(Math.log(Math.max(bytes,1)) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};
export const formatRelativeTime = (iso?: string) => {
  if (!iso) return 'N/A';
  const mins = Math.floor((Date.now() - new Date(iso).getTime())/60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return new Date(iso).toLocaleDateString();
};
export const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : 'N/A');
