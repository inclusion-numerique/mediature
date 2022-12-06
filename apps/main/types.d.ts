declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: string;
  export default content;
}

interface ServerRuntimeConfig {
  //
}

interface PublicRuntimeConfig {
  appMode: 'prod' | 'dev' | 'test';
  appVersion: string;
}

interface RuntimeConfig {
  serverRuntimeConfig: ServerRuntimeConfig;
  publicRuntimeConfig: PublicRuntimeConfig;
}

declare module 'next/config' {
  const value: () => RuntimeConfig;
  export default value;
}
