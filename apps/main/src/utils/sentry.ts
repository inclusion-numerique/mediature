// An empty DSN will disable Sentry
// We want it to be enabled only when deployed
export const dsn = process.env.NODE_ENV === 'production' ? process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN : undefined;

export const environment = process.env.NEXT_PUBLIC_APP_MODE;

export const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE;
