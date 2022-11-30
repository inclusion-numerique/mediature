import path from 'path';
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { StartedGenericContainer } from 'testcontainers/dist/generic-container/started-generic-container';

export interface PostgresContainer {
  container: StartedGenericContainer;
  url: string;
}

export async function setupProgres(): Promise<PostgresContainer> {
  const dummyUser = 'postgres';
  const dummyPassword = 'postgres';
  const dummyDatabase = 'postgres';

  const isPipelineWorker = process.env.CI === 'true';
  if (isPipelineWorker) {
    process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';
  }

  const composeFilePath = path.resolve(__dirname, '../../../');
  const composeFile = 'docker-compose.yaml';
  const serviceName = 'postgres';
  const containerName = 'postgres_container';

  const environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withEnvironment({
      POSTGRES_USER: dummyUser,
      POSTGRES_PASSWORD: dummyPassword,
      POSTGRES_DB: dummyDatabase,
    })
    .withWaitStrategy(serviceName, Wait.forHealthCheck())
    .up([serviceName]);

  const container = environment.getContainer(containerName);

  const ip = container.getHost();
  const mappedPort = container.getMappedPort(5432);

  const url = `postgresql://${dummyUser}:${dummyPassword}@${ip}:${mappedPort}/${dummyDatabase}`;

  return {
    container,
    url,
  };
}
