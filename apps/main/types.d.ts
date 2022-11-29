interface ServerRuntimeConfig {
  //
}

interface PublicRuntimeConfig {
  appMode: 'prod' | 'dev' | 'test';
}

interface RuntimeConfig {
  serverRuntimeConfig: ServerRuntimeConfig;
  publicRuntimeConfig: PublicRuntimeConfig;
}

declare module 'next/config' {
  const value: () => RuntimeConfig;
  export default value;
}
