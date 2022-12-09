export function shouldTargetMock() {
  // We keep looking for a boolean since some builder converts `"true"` automatically
  return process.env.TRPC_SERVER_MOCK === 'true' || (process.env.TRPC_SERVER_MOCK as any) === true;
}

export const mockBaseUrl = 'http://mock.local';
