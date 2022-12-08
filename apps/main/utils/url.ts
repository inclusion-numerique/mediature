import { isBrowser } from '@mediature/main/utils/platform';

export function getBaseUrl() {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  } else if (process.env.NEXT_PUBLIC_APP_BASE_URL) {
    return process.env.NEXT_PUBLIC_APP_BASE_URL;
  } else if (isBrowser) {
    return '';
  }

  return `http://127.0.0.1:${process.env.PORT ?? 3000}`;
}
