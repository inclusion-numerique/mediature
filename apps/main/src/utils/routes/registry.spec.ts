import { LinkRegistry } from '@mediature/main/src/utils/routes/registry';

describe('routes', () => {
  const baseUrl = 'http://localhost:3000';
  let linkRegistry: LinkRegistry;

  beforeAll(async () => {
    linkRegistry = new LinkRegistry({ defaultLang: 'fr', baseUrl: baseUrl });
  });

  it('should get default language link', async () => {
    const link = linkRegistry.get('addAgentToAuthority', { authorityId: 'hello' });
    expect(link).toBe('/tableau-de-bord/collectivite/hello/mediateur/ajouter');
  });

  it('should get overridden language link', async () => {
    const link = linkRegistry.get('addAgentToAuthority', { authorityId: 'hello' }, { lang: 'en' });
    expect(link).toBe('/dashboard/authority/hello/agent/add');
  });

  it('should get an absolute link', async () => {
    const link = linkRegistry.get('addAgentToAuthority', { authorityId: 'hello' }, { absolute: true });
    expect(link).toBe('http://localhost:3000/tableau-de-bord/collectivite/hello/mediateur/ajouter');
  });
});
