/**
 * Builds a full absolute media URL given a base mediaPath and a relative path.
 * If the path is already an absolute HTTP/HTTPS URL, returns it unchanged.
 */
export function buildMediaUrl(mediaPath: string, relativePath?: string): string {
  if (!relativePath) return '';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const base = mediaPath.endsWith('/') ? mediaPath : `${mediaPath}/`;
  return `${base}${relativePath}`;
}

export const buildFlagUrl = buildMediaUrl;
