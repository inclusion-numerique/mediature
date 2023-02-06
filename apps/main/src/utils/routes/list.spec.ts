import { generateRewrites, localizedRoutes } from '@mediature/main/src/utils/routes/list';

describe('route list', () => {
  it('should generate URL rewrites for Next.js', async () => {
    const generated = generateRewrites('en', {
      addAgentToAuthority: localizedRoutes.addAgentToAuthority,
    } as any); // We cast to not test all of them

    expect(generated).toStrictEqual([
      {
        source: '/tableau-de-bord/collectivite/:authorityId/mediateur/ajouter',
        destination: '/dashboard/authority/:authorityId/agent/add',
      },
    ]);
  });
});
