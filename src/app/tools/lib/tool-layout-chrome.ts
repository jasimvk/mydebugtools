export function isApiWorkbenchPath(pathname: string) {
  const normalizedPath = pathname.split('?')[0].replace(/\/+$/, '');
  return normalizedPath === '/tools/api';
}

export function shouldShowGlobalToolHeader(pathname: string) {
  return !isApiWorkbenchPath(pathname);
}
