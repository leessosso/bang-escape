const PROD_BASE_PATH = '/bang-escape';

export function withBasePath(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return process.env.NODE_ENV === 'production'
    ? `${PROD_BASE_PATH}${normalizedPath}`
    : normalizedPath;
}
