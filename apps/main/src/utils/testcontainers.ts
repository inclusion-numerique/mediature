import { StartedGenericContainer } from 'testcontainers/dist/generic-container/started-generic-container';

export interface ContainerLogsOptions {
  enabled: boolean;
}

export async function bindContainerLogs(container: StartedGenericContainer, options: ContainerLogsOptions) {
  if (options.enabled) {
    const stream = await container.logs();
    stream
      .on('data', (line) => console.log(line))
      .on('err', (line) => console.error(line))
      .on('end', () => console.log('Stream closed'));
  }
}
