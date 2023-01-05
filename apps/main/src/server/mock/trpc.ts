import { rest } from 'msw';
import path from 'path';

import { mockBaseUrl } from '@mediature/main/src/server/mock/environment';
import { jsonRpcErrorResponse, jsonRpcSuccessResponse } from '@mediature/main/src/server/mock/requests';
import { RouterInputs, RouterOutputs } from '@mediature/main/src/utils/trpc';

/**
 * Mocks a TRPC endpoint and returns a msw handler for Storybook.
 * Only supports routes with two levels.
 * The path and response is fully typed and infers the type from your routes file.
 * @todo make it accept multiple endpoints
 * @param endpoint.path - path to the endpoint ex. ["post", "create"]
 * @param endpoint.response - response to return ex. {id: 1}
 * @param endpoint.type - specific type of the endpoint ex. "query" or "mutation" (defaults to "query")
 * @returns - msw endpoint
 * @example
 * Page.parameters = {
    msw: {
      handlers: [
        getTRPCMock({
          path: ["post", "getMany"],
          type: "query",
          response: [
            { id: 0, title: "test" },
            { id: 1, title: "test" },
          ],
        }),
      ],
    },
  };
 */
export const getTRPCMock = <
  K1 extends keyof RouterInputs,
  O extends RouterOutputs[K1] // all its keys
>(endpoint: {
  path: [K1];
  response: O;
  type?: 'query' | 'mutation';
}) => {
  const fn = endpoint.type === 'mutation' ? rest.post : rest.get;

  const route = `${mockBaseUrl}/api/trpc/${endpoint.path[0]}`;

  return fn(route, (req, res, ctx) => {
    const rpcResponse =
      (endpoint.response as any) instanceof Error ? jsonRpcErrorResponse(endpoint.response) : jsonRpcSuccessResponse(endpoint.response);

    return res(ctx.json(rpcResponse));
  });
};
