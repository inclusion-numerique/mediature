export function shouldTargetMock() {
  return process.env.TRPC_SERVER_MOCK === 'true';
}

export const mockBaseUrl = 'http://mock.local';
