import { PostgresContainer, setupProgres } from '@mediature/main/utils/database';

describe('database', () => {
  let postgres: PostgresContainer | undefined;

  beforeAll(async () => {
    postgres = await setupProgres();
  }, 30 * 1000);

  afterAll(async () => {
    if (postgres) {
      await postgres.container.stop();
    }
  });

  describe('testcontainers', () => {
    it('should be working', () => {
      jest.setTimeout(5 * 1000);
    });
  });
});
