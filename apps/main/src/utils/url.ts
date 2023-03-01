import { isBrowser } from './platform';

export function getBaseUrl() {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  } else if (process.env.NEXT_PUBLIC_APP_BASE_URL) {
    return process.env.NEXT_PUBLIC_APP_BASE_URL;
  } else if (isBrowser) {
    return '';
  }

  return `http://localhost:${process.env.PORT ?? getListeningPort()}`;
}

export function getListeningPort() {
  return process.env.PORT ?? 3000;
}
